import TypedPromise from "../TypedPromise.ts";

function delay(ms) {
  return new TypedPromise((res, _) => setTimeout(() => res(1), ms));
}

Promise.resolve(1)
  .then(() => Promise.resolve(delay(2000)))
  .then(
    v => console.log("Promise", v),
    e => console.error("*e:", e)
  );

TypedPromise.resolve(1)
  .then(() => TypedPromise.resolve(delay(2000)))
  .then(
    v => console.log("TypedPromise", v),
    e => console.error("*e:", e)
  );

