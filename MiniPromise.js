/// A Promise is nothing more than an object that holds some states and wraps the callback
/// to make it looks better.
/// promise.then(fn1, fn2) may get called for multiple times, use array to store those functions.

export default class MiniPromise {
  constructor(fn) {
    if (typeof this !== "object") {
      throw new TypeError('Promise must be constructed with keyword "new"');
    }
    if (!is_function(fn)) {
      throw new TypeError("constructor argument have to be a function");
    }
    this.status = "pending";
    this.fulfilled_fns = [];
    this.rejected_fns = [];

    /// If `val` is a Promise Object, it will be unwrapped recursively.
    const on_fulfilled = val => {
      if (is_thenable(val)) {
        val.then(on_fulfilled, on_rejected);
        return;
      }
      if (this.status !== "pending") {
        throw new Error(`on_fulfilled was called multiple times`);
      }
      this.status = "fulfilled";
      this.val = val;
      queueMicrotask(() =>
        this.fulfilled_fns.forEach(fn => fn(val))
      );
    };

    const on_rejected = err => {
      if (this.status !== "pending") {
        throw new Error(`on_rejected was called multiple times`);
      }
      this.status = "rejected";
      this.err = err;
      queueMicrotask(() =>
        this.rejected_fns.forEach(fn => fn(err))
      );
    };

    fn(on_fulfilled, on_rejected);
  }

  then(handle_value, handle_error) {
    return new MiniPromise((res, rej) => {
      const real_res_fn = val => {
        if (!is_function(handle_value)) {
          res(val);
          return;
        }
        try {
          res(handle_value(val));
        } catch (e) {
          rej(e);
        }
      };

      const real_rej_fn = err => {
        if (!is_function(handle_error)) {
          rej(err);
          return;
        }
        try {
          res(handle_error(err));
        } catch (e) {
          rej(e);
        }
      };

      switch (this.status) {
        case "pending":
          this.fulfilled_fns.push(real_res_fn);
          this.rejected_fns.push(real_rej_fn);
          break;
        case "fulfilled":
          queueMicrotask(() => real_res_fn(this.val));
          break;
        case "rejected":
          queueMicrotask(() => real_rej_fn(this.err));
          break;
      }
    });
  }

  catch(rej_fn) {
    return this.then(null, rej_fn);
  }

  finally(finally_fn) {
    return this.then(
      val => MiniPromise.resolve(finally_fn()).then(() => val),
      err => MiniPromise.resolve(finally_fn()).then(() => { throw err; }),
    );
  }

  /// Execute an array of Promise objects, collect all result(call `then`) and
  /// return them in an array.
  ///
  /// But if any one of the objects triggered reject, just ignore the result
  /// and reject directly.
  static all(promise_array) {
    if (!Array.isArray(promise_array)) {
      throw new TypeError("Promise.all need Array object as argument");
    }
    return new MiniPromise((res, rej) => {
      let count = promise_array.length;
      const result = [];
      const handler_of = idx => v => {
        result[idx] = v;
        if (--count === 0) { res(result); }
      };
      promise_array.forEach((p, idx) => p.then(handler_of(idx), rej));
    });
  }

  /// Execute an array of Promise objects, only return the result of the one
  /// who call `then` first.
  static race(promise_array) {
    if (!Array.isArray(promise_array)) {
      throw new TypeError("Promise.race need Array object as argument");
    }
    return new MiniPromise((res, rej) =>
      promise_array.forEach(p => p.then(res, rej))
    );
  }

  static any(promise_array) {
    if (!Array.isArray(promise_array)) {
      throw new TypeError("Promise.any need Array object as argument");
    }
    return new MiniPromise((res, rej) => {
      let count = promise_array.length;
      const rej_handler = e => {
        if (--count === 0) { rej(e); }
      };
      promise_array.forEach(p => p.then(res, rej_handler));
    });
  }

  static resolve(v) {
    return new MiniPromise((res, _) => res(v));
  }

  static reject(v) {
    return new MiniPromise((_, rej) => rej(v));
  }
}

function is_thenable(obj) {
  return is_function(obj?.then);
}

function is_function(obj) {
  return typeof obj === "function";
}