/**
 * A Promise object has and only has 3 kind of states. Use numbers to represend
 * states for better performance.
 */
const PENDING = 0, FULFILLED = 1, REJECTED = 2;




class Promise {
  /**
   * A Promise is nothing more than an object that holds some states and wraps
   * the callback to make it looks better.
   *
   * To create a Promise Object, you need to give a function as argument.
   */
  constructor(fn) {
    if (!isFunction(fn))
      throw new TypeError("Pass function object to create a Promise object");

    this._status = PENDING;
    this._resolves = [];
    this._rejects = [];
    this._v = undefined;

    setTimeout(fn, null, this.resolve.bind(this), this.reject.bind(this));
    //fn(this.resolve.bind(this), this.reject.bind(this));
  }


  /**
   * This is one of the functions that users use to handle the Promise object.
   *
   * This function should only be called once.
   */
  resolve(v) {
    if (this._status !== PENDING)
      return;

    this._v = v;
    this._status = FULFILLED;

    var fn;
    while (fn = this._resolves.shift())
      fn.call(this, v);
  }


  /**
   * This is the other function that users use to handle the Promise object.
   *
   * This function should only be called once, too.
   */
  reject(v) {
    if (this._status !== PENDING)
      return;

    this._v = v;
    this._status = REJECTED;

    var fn;
    while (fn = this._rejects.shift())
      fn.call(this, v);
  }


  /**
   * `promise.then` is the most important method for Promise. It's the key to
   * hold a Promise chain.
   *
   * If resFn or rejFn is not function, just ignore them, and pass value of
   * the previous promise directly to the next promise. Just like you didn't
   * write this `then`.
   */
  then(resFn, rejFn) {
    return new Promise((res, rej) => {

      function realResFn(v) {
        if (!isFunction(resFn))
          return res(v);

        try {
          var r = resFn(v);
          if (isThenable(r))
            r.then(res, rej);
          else
            res(r);
        } catch (e) {
          rej(e);
        }
      }

      function realRejFn(v) {
        if (!isFunction(rejFn))
          return rej(v);

        try {
          var r = rejFn(v);
          if (isThenable(r))
            r.then(res, rej);
          else
            res(r);
        } catch (e) {
          rej(e);
        }
      }

      switch (this._status) {
      case PENDING:
        this._resolves.push(realResFn);
        this._rejects.push(realRejFn);
        break;

      case FULFILLED:
        realResFn(this._v);
        break;

      case REJECTED:
        realRejFn(this._v);
        break;
      }
    });
  }


  /**
   * `promise.catch(rejFn)` is nothing but `promise.then(null, rejFn)`
   */
  catch (rejFn) {
    return this.then(null, rejFn);
  }


  /**
   * Execute an array of Promise objects, collect all result(call `then`) and
   * return them in an array.
   *
   * But if any one of the objects triggered reject, just ignore the result
   * and reject directly.
   */
  static all(promiseArr) {
    if (!Array.isArray(promiseArr))
      throw new TypeError("Promise.all need Array object as argument");

    return new Promise((res, rej) => {
      var count = promiseArr.length;
      const result = [];

      promiseArr.forEach((p, idx) => {
        p.then(handle(idx), rej);
      });

      /* Use closure to hold index */
      function handle(idx) {
        return v => {
          result[idx] = v;

          if (--count === 0)
            res(result);
        };
      }
    });
  }


  /**
   * Execute an array of Promise objects, only return the result of the one
   * who call `then` first.
   */
  static race(promiseArr) {
    if (!Array.isArray(promiseArr))
      throw new TypeError("Promise.race need Array object as argument");

    return new Promise((res, rej) => {
      promiseArr.forEach(p => p.then(res, rej));
    });
  }


  /**
   * If you need to start a Promise chain from a basic value, just use this.
   * e.g. Promise.resolve(1).then(console.log);
   */
  static resolve(v) {
    return new Promise((res, _) => res(v));
  }


  /**
   * Just like Promise.resolve, but start with an rejection.
   */
  static reject(v) {
    return new Promise((_, rej) => rej(v));
  }
}


/**
 * Some utilitiy functions who is needed for multiple times.
 */
function isThenable(obj) {
  return obj && isFunction(obj.then);
}


function isFunction(obj) {
  return typeof obj === "function";
}



module.exports = Promise;


