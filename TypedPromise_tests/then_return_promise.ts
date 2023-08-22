import TypedPromise from "../TypedPromise";

function sleep(milliseconds): TypedPromise<any> {
  return new TypedPromise((res, _rej) => setTimeout(res, milliseconds));
}

Promise.resolve(1)
  .then(() => Promise.resolve(sleep(2000)))
  .then(
    v => console.log("Promise", v),
    e => console.error("*e:", e)
  );

TypedPromise.resolve(1)
  .then(() => TypedPromise.resolve(sleep(2000)))
  .then(
    v => console.log("TypedPromise", v),
    e => console.error("*e:", e)
  );

