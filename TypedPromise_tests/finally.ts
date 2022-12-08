import TypedPromise from "../TypedPromise.ts";

function sleep(milliseconds) {
  return new TypedPromise((res, _rej) => setTimeout(res, milliseconds));
}

TypedPromise.resolve(3).finally(() => sleep(3000))
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));

TypedPromise.reject(3).finally(() => sleep(3000) as TypedPromise<number>)
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));
