/// A Promise is nothing more than an object that holds some states and wraps the callback
/// to make it looks better.
/// promise.then(fn1, fn2) may get called for multiple times, use array to store those functions.

export default class DirtyPromise {
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
    return new DirtyPromise((res, rej) => {
      const wrapped_handle_value = val => {
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

      const wrapped_handle_error = err => {
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
          this.fulfilled_fns.push(wrapped_handle_value);
          this.rejected_fns.push(wrapped_handle_error);
          break;
        case "fulfilled":
          queueMicrotask(() =>
            wrapped_handle_value(this.val)
          );
          break;
        case "rejected":
          queueMicrotask(() =>
            wrapped_handle_error(this.err)
          );
          break;
      }
    });
  }

  catch(handle_error) {
    return this.then(null, handle_error);
  }

  finally(handle_fn) {
    return this.then(
      val => DirtyPromise.resolve(handle_fn()).then(() => val),
      err => DirtyPromise.resolve(handle_fn()).then(() => { throw err; }),
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
    return new DirtyPromise((res, rej) => {
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
    return new DirtyPromise((res, rej) =>
      promise_array.forEach(p => p.then(res, rej))
    );
  }

  static any(promise_array) {
    if (!Array.isArray(promise_array)) {
      throw new TypeError("Promise.any need Array object as argument");
    }
    return new DirtyPromise((res, rej) => {
      let count = promise_array.length;
      const rej_handler = e => {
        if (--count === 0) { rej(e); }
      };
      promise_array.forEach(p => p.then(res, rej_handler));
    });
  }

  static resolve(v) {
    return new DirtyPromise((res, _) => res(v));
  }

  static reject(v) {
    return new DirtyPromise((_, rej) => rej(v));
  }
}

function is_thenable(obj) {
  return is_function(obj?.then);
}

function is_function(obj) {
  return typeof obj === "function";
}