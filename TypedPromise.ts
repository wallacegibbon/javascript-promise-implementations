/// For some reason, the following recursive definition is not enough, you have to be more explicit,
// type ValueOrPromisedValue<T> = T | TypedPromise<ValueOrPromisedValue<T>>;
/// like this:
type ValueOrPromisedValue<T> = T | TypedPromise<T> | TypedPromise<ValueOrPromisedValue<T>>;

type ThenResFn<T1, T2> = ((val: T1) => ValueOrPromisedValue<T2>) | null | undefined;
type ThenRejFn<T2, Err> = ((err: Err) => ValueOrPromisedValue<T2>) | null | undefined;

type WrappedThenResFn<T1> = (val: T1) => void;
type WrappedThenRejFn<Err> = (err: Err) => void;

type OnFulFilledFn<T1> = (val: ValueOrPromisedValue<T1>) => void;
type OnRejectedFn<Err> = (err: Err) => void;

type PromiseStatus = "resolved" | "rejected" | "pending";

export default class TypedPromise<T, Err = unknown> {
  private status: PromiseStatus = "pending";
  private payload: T | unknown;
  private resolve_fns: Array<WrappedThenResFn<T>> = [];
  private reject_fns: Array<WrappedThenRejFn<Err>> = [];

  constructor(
    fn: (res: OnFulFilledFn<T>, rej: OnRejectedFn<Err>) => void
  ) {
    const on_fulfilled: OnFulFilledFn<T> = val => {
      if (val instanceof TypedPromise<T>) {
        val.then(
          on_fulfilled,
          on_rejected as ThenRejFn<unknown, unknown>
        );
        return;
      }
      /// if program reached here, val will be of type T.
      this.status = "resolved";
      this.payload = val;
      queueMicrotask(
        () => this.resolve_fns.forEach(f => f(val))
      );
    };
    const on_rejected: OnRejectedFn<Err> = err => {
      this.status = "rejected";
      this.payload = err;
      queueMicrotask(
        () => this.reject_fns.forEach(f => f(err))
      );
    };
    fn(on_fulfilled, on_rejected);
  }

  then<T2 = T, Err2 = unknown>(
    handle_value: ThenResFn<T, T2>,
    handle_error?: ThenRejFn<T2, Err>,
  ): TypedPromise<T2, Err2> {
    return new TypedPromise((res, rej) => {
      const wrapped_handle_value: WrappedThenResFn<T> = val => {
        if (!is_function(handle_value)) {
          res(val as unknown as T2);
          return;
        }
        try {
          res(handle_value(val));
        } catch (e) {
          rej(e);
        }
      };
      const wrapped_handle_error: WrappedThenRejFn<Err> = err => {
        if (!is_function(handle_error)) {
          rej(err as unknown as Err2);
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
          this.resolve_fns.push(wrapped_handle_value);
          this.reject_fns.push(wrapped_handle_error);
          break;
        case "resolved":
          queueMicrotask(() =>
            wrapped_handle_value(this.payload as T)
          );
          break;
        case "rejected":
          queueMicrotask(() =>
            wrapped_handle_error(this.payload as Err)
          );
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

    const handle_value = (val: T) =>
      TypedPromise.resolve(handle_fn())
        .then(_ => val);

    const handle_error = (err: Err) =>
      TypedPromise.resolve(handle_fn())
        .then(_ => TypedPromise.reject(err as unknown as T));

    return this.then(handle_value, handle_error);
  }

  static all(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<Array<unknown>> {
    return new TypedPromise((res, rej) => {
      let count = promise_array.length;
      const result: Array<unknown> = [];
      const handler_of = (idx: number) => v => {
        result[idx] = v;
        if (--count === 0) { res(result); }
      };
      promise_array.forEach((p, idx) => p.then(handler_of(idx), rej));
    });
  }

  static race(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<unknown> {
    return new TypedPromise((res, rej) =>
      promise_array.forEach(p => p.then(res, rej))
    );
  }

  static any(
    promise_array: Array<TypedPromise<unknown>>
  ): TypedPromise<unknown> {
    return new TypedPromise((res, rej) => {
      let count = promise_array.length;
      const rej_handler = e => {
        if (--count === 0) { rej(e); }
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