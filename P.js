//////////////////////////////////////////////////////////////////////////////
// Some utils
function isFunction(obj) {
  return typeof obj === "function";
}

function isThenable(obj) {
  return obj && isFunction(obj.then);
}

//////////////////////////////////////////////////////////////////////////////
function resolve(value) {
  this._value = value;
  this._status = "fulfilled";

  var fn;
  while (fn = this._resolves.shift())
    fn.call(this, value);
}

function reject(reason) {
  this._reason = reason;
  this._status = "rejected";

  var fn;
  while (fn = this._rejects.shift())
    fn.call(this, reason);
}

//////////////////////////////////////////////////////////////////////////////
// The constructor function
function Promise(fn) {
  if (!isFunction(fn))
    throw new TypeError("Promise argument error:" + fn.toString());

  this._status = "pending";
  this._resolves = [];
  this._rejects = [];
  this._value;
  this._reason;

  fn(resolve.bind(this), reject.bind(this));
}


//////////////////////////////////////////////////////////////////////////////
// The most important function for Promise is `then`

// `resolve` have different rules against `reject`:
// `resolve` will always trigger the `resolve` of next Promise, while
// `reject` may trigger the `reject` or `resolve` of next Promise.

function resolveWrapper(nResolve, nReject, pResolveFn) {
  return function(value) {
    if (!isFunction(pResolveFn))
      return nResolve(value);

    try {
      var ret = pResolveFn(value);
      if (isThenable(ret))
        ret.then(nResolve, nReject);
      else
        nResolve(ret);
    } catch (e) {
      nReject(e);
    }
  };
}

function rejectWrapper(nResolve, nReject, pRejectFn) {
  return function(reason) {
    if (!isFunction(pRejectFn))
      return nReject(reason);

    try {
      var ret = pRejectFn(reason);
      if (isThenable(ret))
        ret.then(nResolve, nReject);
      else
        nResolve(ret);
    } catch (e) {
      nReject(e);
    }
  };
}

function thenHandler(nResolve, nReject,
    pResolveFn, pRejectFn, pPromise) {
  var rsFn = resolveWrapper(nResolve, nReject, pResolveFn);
  var rjFn = rejectWrapper(nResolve, nReject, pRejectFn);

  switch (pPromise._status) {
  case "pending":
    pPromise._resolves.push(rsFn);
    pPromise._rejects.push(rjFn);
    break;
  case "fulfilled":
    rsFn(pPromise._value);
    break;
  case "rejected":
    rjFn(pPromise._reason);
    break;
  default:
    throw new Error("invalid status:" + pPromise._status);
  }
}

Promise.prototype.then = function(resolveFn, rejectFn) {
  var pPromise = this;
  return new Promise((resolve, reject) => {
    thenHandler(resolve, reject, resolveFn, rejectFn, pPromise);
  });
};

Promise.prototype.catch = function(reason) {
  return this.then(null, reason);
};

//////////////////////////////////////////////////////////////////////////////
// Some utils
Promise.resolve = function(val) {
  return new Promise((resolve, reject) => {
    resolve(val);
  });
};

Promise.reject = function(reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

//////////////////////////////////////////////////////////////////////////////
// Promise.all
function handleAll(promises, resolve, reject) {
  // all promises share the same `count` and `result`.
  var count = promises.length;
  var result = [];

  function handle(i) {
    return function(value) {
      result[i] = value;
      if (--count === 0) resolve(result);
    };
  }

  promises.forEach((p, i) => {
    p.then(handle(i), reject);
  });
}

Promise.all = function(promises) {
  if (!Array.isArray(promises))
    throw new TypeError("Promise.all only accept Array argument");

  return new Promise((resolve, reject) => {
    handleAll(promises, resolve, reject);
  });
};

//////////////////////////////////////////////////////////////////////////////
// Promise.race
Promise.race = function(promises) {
  if (!Array.isArray(promises))
    throw new TypeError("Promise.race only accept Array argument");

  return new Promise((resolve, reject) => {
    promises.forEach((p) => p.then(resolve, reject));
  });
};

//////////////////////////////////////////////////////////////////////////////
// For nodejs usage
module.exports = Promise;

