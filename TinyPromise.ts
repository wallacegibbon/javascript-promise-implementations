type PromiseStatus = "resolved" | "rejected" | "pending";
type ResRejFn<T> = (arg: T | Promise<T>) => void;
type ResRejFnRaw<T1, T2> = ((arg: T1) => T2) | null;

export default class TinyPromise<T> {
  private status: PromiseStatus = "pending";
  private payload: T | unknown;
  private resolve_fns: Array<ResRejFn<T>> = [];
  private reject_fns: Array<ResRejFn<T>> = [];

  constructor(
    fn: (res: ResRejFn<T>, rej: ResRejFn<unknown>) => void
  ) {
    const on_fulfilled: ResRejFn<T> = val => {
      if (is_Promise<TinyPromise<T>>(val)) {
        val.then(v1 => on_fulfilled(v1), e1 => on_rejected(e1));
        return;
      }
      this.status = "resolved";
      this.payload = val;
      queueMicrotask(() => this.resolve_fns.forEach(f => f(val)));
    };
    const on_rejected = err => {
      this.status = "rejected";
      this.payload = err;
      queueMicrotask(() => this.reject_fns.forEach(f => f(err)));
    };
    fn(on_fulfilled, on_rejected);
  }

  then<N = T>(
    handle_value: ResRejFnRaw<T, N>,
    handle_error: ResRejFnRaw<unknown, N>
  ): TinyPromise<N> {
    return new TinyPromise((res, rej) => {
      const handle_value_new: ResRejFn<T> = val => handle_value ? res(handle_value(val)) : res(val);
      const handle_error_new: ResRejFn<unknown> = err => handle_error ? res(handle_error(err)) : rej(err);
      switch (this.status) {
        case "pending":
          this.resolve_fns.push(handle_value_new);
          this.reject_fns.push(handle_error_new);
          break;
        case "resolved":
          queueMicrotask(() => handle_value_new(this.payload as T));
          break;
        case "rejected":
          queueMicrotask(() => handle_error_new(this.payload));
          break;
      }
    });
  }

  catch(rej_fn) {
    return this.then(null, rej_fn);
  }

  static resolve<N>(v: N) {
    return new TinyPromise<N>((res, _) => res(v));
  }

  static reject<N>(v: N) {
    return new TinyPromise<N>((_, rej) => rej(v));
  }
}

function is_Promise<T>(obj): obj is TinyPromise<T> {
  return !!obj?.then;
}