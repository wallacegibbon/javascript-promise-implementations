class MiniPromise {
  /**
   * A Promise is nothing more than an object that holds some states and wraps
   * the callback to make it looks better.
   *
   * promise.then(fn1, fn2) may get called for multiple times, use array to
   * store those functions.
   *
   * @param {Function} fn
   */
  constructor(fn) {
    if (!isFunction(fn)) {
      throw new TypeError("constructor argument have to be a function");
    }
    this.status = "pending";
    this.fulfilledFns = [];
    this.rejectedFns = [];

    const res = this.onFulfilled.bind(this);
    const rej = this.onRejected.bind(this);

    setTimeout(fn, null, res, rej);
    //fn(res, rej);
  }


  /**
   * If `val` is a Promise Object, it will be unwrapped recursively.
   */
  onFulfilled(val) {
    if (isThenable(val)) {
      return val.then(this.onFulfilled.bind(this), this.onRejected.bind(this))
    }
    if (this.status !== "pending") {
      throw new Error(`onFulfilled was called multiple times`);
    }
    this.status = 'fulfilled';
    this.val = val;
    var fn;
    while (fn = this.fulfilledFns.shift()) {
      fn.call(this, val);
    }
  }

  /**
   * If `err` is a Promise Object, it will be unwrapped recursively.
   *
   * Even if the Promise Object `err` will be fulfilled, the fullfilled value
   * will be handled by onRejected.
   *
   * I am not sure whether this is the same as the Promise standard,
   * but it make sense.
   */
  onRejected(err) {
    if (isThenable(err)) {
      return err.then(this.onRejected.bind(this), this.onRejected.bind(this))
    }
    if (this.status !== "pending") {
      throw new Error(`onRejected was called multiple times`);
    }
    this.status = 'rejected';
    this.err = err
    var fn;
    while (fn = this.rejectedFns.shift()) {
      fn.call(this, err);
    }
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
    return new MiniPromise((res, rej) => {
      switch (this.status) {
      case "pending":
        this.fulfilledFns.push(realResFn);
        this.rejectedFns.push(realRejFn);
        break;

      case "fulfilled":
        realResFn(this.val);
        break;

      case "rejected":
        realRejFn(this.err);
        break;
      }

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

    return new MiniPromise((res, rej) => {
      var count = promiseArr.length;
      const result = [];
      promiseArr.forEach((p, idx) => p.then(handle(idx), rej));

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

    return new MiniPromise((res, rej) =>
      promiseArr.forEach(p => p.then(res, rej)));
  }


  /**
   * If you need to start a Promise chain from a basic value, just use this.
   * e.g. Promise.resolve(1).then(console.log);
   */
  static resolve(v) {
    return new MiniPromise((res, _) => res(v));
  }


  /**
   * Just like Promise.resolve, but start with an rejection.
   */
  static reject(v) {
    return new MiniPromise((_, rej) => rej(v));
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



module.exports = MiniPromise;


