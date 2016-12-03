//////////////////////////////////////////////////////////////////////////////
// the status constants
var PENDING = 0, FULFILLED = 1, REJECTED = 2


//////////////////////////////////////////////////////////////////////////////
// Some utils
function isFunction(obj) {
  return typeof obj === "function"
}

function isThenable(obj) {
  return obj && isFunction(obj.then)
}

function checkArray(obj) {
  if (!Array.isArray(obj))
    throw new TypeError(`${obj} is not array`)
}

//////////////////////////////////////////////////////////////////////////////
function resolve(value) {
  this._value = value
  this._status = FULFILLED

  var fn
  while (fn = this._resolves.shift())
    fn.call(this, value)
}

function reject(reason) {
  this._reason = reason
  this._status = "rejected"

  var fn
  while (fn = this._rejects.shift())
    fn.call(this, reason)
}

//////////////////////////////////////////////////////////////////////////////
// The constructor function
function Promise(fn) {
  if (!isFunction(fn))
    throw new TypeError("Promise argument error:" + fn.toString())

  this._status = PENDING
  this._resolves = []
  this._rejects = []
  this._value
  this._reason

  fn(resolve.bind(this), reject.bind(this))
}


//////////////////////////////////////////////////////////////////////////////
// The most important function for Promise is `then`

// `resolve` have different rules against `reject`:
// `resolve` will always trigger the `resolve` of next Promise, while
// `reject` may trigger the `reject` or `resolve` of next Promise.

function resolveWrapper(nRes, nRej, pResFn) {
  return function(value) {
    if (!isFunction(pResFn))
      return nRes(value)

    try {
      var ret = pResFn(value)
      if (isThenable(ret))
        ret.then(nRes, nRej)
      else
        nRes(ret)
    } catch (e) {
      nRej(e)
    }
  }
}

function rejectWrapper(nRes, nRej, pRejFn) {
  return function(reason) {
    if (!isFunction(pRejFn))
      return nRej(reason)

    try {
      var ret = pRejFn(reason)
      if (isThenable(ret))
        ret.then(nRes, nRej)
      else
        nRes(ret)
    } catch (e) {
      nRej(e)
    }
  }
}

function thenHandler(nRes, nRej, pResFn, pRejFn, pP) {
  var rsFn = resolveWrapper(nRes, nRej, pResFn)
  var rjFn = rejectWrapper(nRes, nRej, pRejFn)

  switch (pP._status) {
  case PENDING:
    pP._resolves.push(rsFn)
    pP._rejects.push(rjFn)
    break
  case FULFILLED:
    rsFn(pP._value)
    break
  case "rejected":
    rjFn(pP._reason)
    break
  default:
    throw new Error(`invalid status:${pP._status}`)
  }
}

Promise.prototype.then = function(resFn, rejFn) {
  var pP = this
  return new Promise((res, rej) => thenHandler(res, rej, resFn, rejFn, pP))
}

//////////////////////////////////////////////////////////////////////////////
// Some utils
Promise.prototype.catch = function(reason) { return this.then(null, reason); }
Promise.resolve = (value) => new Promise((res, _) => res(value))
Promise.reject = (reason) => new Promise((_, rej) => rej(reason))


//////////////////////////////////////////////////////////////////////////////
// Promise.all
function handleAll(promises, resolve, reject) {
  // all promises share the same `count` and `result`.
  var count = promises.length
  var result = []
  function handle(i) {
    return function(value) {
      result[i] = value
      if (--count === 0) resolve(result)
    }
  }
  promises.forEach((p, i) => p.then(handle(i), reject))
}


Promise.all = function(promises) {
  checkArray(promises)
  return new Promise((res, rej) => handleAll(promises, res, rej))
}

//////////////////////////////////////////////////////////////////////////////
// Promise.race
Promise.race = function(promises) {
  checkArray(promises)
  return new Promise((res, rej) => promises.forEach(p => p.then(res, rej)))
}

//////////////////////////////////////////////////////////////////////////////
// For nodejs usage
module.exports = Promise

