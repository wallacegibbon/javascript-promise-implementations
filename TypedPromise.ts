/// For some reason, the following recursive definition is not enough, you have to be more explicit.
// type ValueOrPromisedValue<T> = T | TypedPromise<ValueOrPromisedValue<T>>;

/// The More explicit version:
type ValueOrPromisedValue<T> = T | TypedPromise<T> | TypedPromise<ValueOrPromisedValue<T>>;

type ThenResFn<T1, T2> = ((val: T1) => ValueOrPromisedValue<T2>) | null | undefined;
type ThenRejFn<T2, Err> = ((err: Err) => ValueOrPromisedValue<T2>) | null | undefined;

/// !TODO: change code to make WrappedThenResFn and OnFulFilledFn the same type.
type WrappedThenResFn<T1> = (val: T1) => void;
type WrappedThenRejFn<Err> = (err: Err) => void;
type OnFulFilledFn<T1> = (val: ValueOrPromisedValue<T1>) => void;
type OnRejectedFn<Err> = (err: Err) => void;

type PromiseStatus<T, Err> =
  | { name: "resolved", payload: T }
  | { name: "rejected", payload: Err }
  | { name: "pending", payload: undefined };

export default class TypedPromise<T, Err = unknown> {
  private status: PromiseStatus<T, Err> = { name: "pending", payload: undefined };
  private resolve_fns: Array<WrappedThenResFn<T>> = [];
  private reject_fns: Array<WrappedThenRejFn<Err>> = [];

  constructor(fn: (res: OnFulFilledFn<T>, rej: OnRejectedFn<Err>) => void) {
    let on_fulfilled: OnFulFilledFn<T> = val => {
      if (val instanceof TypedPromise)
        return val.then(on_fulfilled, on_rejected as ThenRejFn<unknown, unknown>);
      if (this.status.name !== "pending")
        throw new Error(`on_fulfilled was called multiple times`);

      this.status = { name: "resolved", payload: val };
      queueMicrotask(() => this.resolve_fns.forEach(f => f(val)));
    };

    let on_rejected: OnRejectedFn<Err> = err => {
      if (this.status.name !== "pending")
        throw new Error(`on_rejected was called multiple times`);

      this.status = { name: "rejected", payload: err };
      queueMicrotask(() => this.reject_fns.forEach(f => f(err)));
    };

    fn(on_fulfilled, on_rejected);
  }

  then<T2 = T, Err2 = unknown>(
    handle_value: ThenResFn<T, T2>,
    handle_error?: ThenRejFn<T2, Err>,
  ): TypedPromise<T2, Err2> {
    return new TypedPromise((res, rej) => {
      let wrapped_handle_value: WrappedThenResFn<T> = val => {
        if (!is_function(handle_value)) return res(val as unknown as T2);
        try {
          res(handle_value(val));
        } catch (e) {
          rej(e);
        }
      };

      let wrapped_handle_error: WrappedThenRejFn<Err> = err => {
        if (!is_function(handle_error)) return rej(err as unknown as Err2);
        try {
          res(handle_error(err));
        } catch (e) {
          rej(e);
        }
      };

      switch (this.status.name) {
        case "pending":
          this.resolve_fns.push(wrapped_handle_value);
          this.reject_fns.push(wrapped_handle_error);
          break;
        case "resolved":
          let value = this.status.payload;
          queueMicrotask(() => wrapped_handle_value(value));
          break;
        case "rejected":
          let error = this.status.payload;
          queueMicrotask(() => wrapped_handle_error(error));
          break;
      }
    });
  }

  catch<T2, Err2>(
    handle_error: ThenRejFn<T2, Err>
  ): TypedPromise<T2, Err2> {
    return this.then(null, handle_error);
  }

  finally(
    handle_fn: () => ValueOrPromisedValue<T>
  ): TypedPromise<T> {

    let handle_value = (val: T) =>
      TypedPromise.resolve(handle_fn())
        .then(_ => val);

    let handle_error = (err: Err) =>
      TypedPromise.resolve(handle_fn())
        .then(_ => TypedPromise.reject(err as unknown as T));

    return this.then(handle_value, handle_error);
  }

  static all(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<Array<unknown>> {
    return new TypedPromise((res, rej) => {
      let count = promise_array.length;
      let result: Array<unknown> = [];
      let handler_of = (idx: number) => v => {
        result[idx] = v;
        if (--count === 0) res(result);
      };
      promise_array.forEach((p, idx) => p.then(handler_of(idx), rej));
    });
  }

  static race(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<unknown> {
    return new TypedPromise((res, rej) => promise_array.forEach(p => p.then(res, rej)));
  }

  static any(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<unknown> {
    return new TypedPromise((res, rej) => {
      let count = promise_array.length;
      let rej_handler = e => {
        if (--count === 0) rej(e);
      };
      promise_array.forEach(p => p.then(res, rej_handler));
    });
  }

  static resolve<A>(
    v: ValueOrPromisedValue<A>
  ): TypedPromise<A> {
    return new TypedPromise<A>((res, _) => res(v));
  }

  static reject<A>(
    v: A
  ): TypedPromise<A> {
    return new TypedPromise<A>((_, rej) => rej(v));
  }
}

function is_function(obj): obj is Function {
  return typeof obj === "function";
}
