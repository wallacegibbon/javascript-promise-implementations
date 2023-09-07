type PromiseStatus<T, Err> =
  | {name: "resolved", payload: T}
  | {name: "rejected", payload: Err}
  | {name: "pending", payload: undefined}

type ThenOnFulfilledFn<T> = (v: T) => any
type ThenOnRejectedFn<Err> = (e: Err) => any
type ClusurePromiseExecutor<T, Err> = (res: ThenOnFulfilledFn<T>, rej: ThenOnRejectedFn<Err>) => void

export let create = <T, Err = unknown>(executor: ClusurePromiseExecutor<T, Err>) => {
  let resolve_fns: Array<ThenOnFulfilledFn<T>> = []
  let reject_fns: Array<ThenOnRejectedFn<Err>> = []
  let status: PromiseStatus<T, Err> = {name: "pending", payload: void 0}

  let wrapped_res = (val) => {
    if (status.name !== "pending") {
      throw new Error(`wrapped_res was called multiple times`)
    }
    /// !IMPORTANT! This is why nested promises are unwrapped.
    if (typeof val?.then === "function") {
      return val.then(wrapped_res, wrapped_rej)
    }
    status = {name: "resolved", payload: val}
    queueMicrotask(() => resolve_fns.forEach((f) => f(val)))
  }

  let wrapped_rej = (err) => {
    if (status.name !== "pending") {
      throw new Error(`wrapped_rej was called multiple times`)
    }
    status = {name: "rejected", payload: err}
    queueMicrotask(() => reject_fns.forEach((f) => f(err)))
  }

  executor(wrapped_res, wrapped_rej)

  let then_fn = (onfulfilled?: ThenOnFulfilledFn<T>, onrejected?: ThenOnRejectedFn<Err>) =>
    create((res, rej) => {
      let wrapped_res = (val) => {
        if (typeof onfulfilled !== "function") {
          return res(val)
        }
        try {
          res(onfulfilled(val))
        } catch (e) {
          rej(e)
        }
      }

      let wrapped_rej = (err) => {
        if (typeof onrejected !== "function") {
          return rej(err)
        }
        try {
          res(onrejected(err))
        } catch (e) {
          rej(e)
        }
      }

      switch (status.name) {
        case "pending":
          resolve_fns.push(wrapped_res)
          reject_fns.push(wrapped_rej)
          break
        case "resolved":
          queueMicrotask(() => wrapped_res(status.payload))
          break
        case "rejected":
          queueMicrotask(() => wrapped_rej(status.payload))
          break
      }
    })

  let catch_fn = (onrejected) => then_fn(void 0, onrejected)

  let finally_fn = (handle_fn: () => unknown) => then_fn(
    (v) => resolve(handle_fn()).then(() => v),
    (e) => resolve(handle_fn()).then(() => reject(e)),
  )

  return {
    then: then_fn,
    catch: catch_fn,
    finally: finally_fn,
  }
}

export let resolve = (v) => create((res, _) => res(v))
export let reject = (v) => create((_, rej) => rej(v))

export let all = (promise_array) => create((res, rej) => {
  let count = promise_array.length
  let result: Array<unknown> = []
  let handler_of = (idx: number) => (v) => {
    result[idx] = v
    if (--count === 0) {
      res(result)
    }
  }
  promise_array.forEach((p, idx) => p.then(handler_of(idx), rej))
})

export let race = (promise_array) => create((res, rej) => {
  promise_array.forEach((p) => p.then(res, rej))
})
