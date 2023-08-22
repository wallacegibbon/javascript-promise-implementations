import DirtyPromise from "../DirtyPromise.js";

function sleep(milliseconds) {
  return new Promise((res, _rej) => setTimeout(res, milliseconds));
}

DirtyPromise.resolve(3)
  .finally(() => sleep(3000))
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));

DirtyPromise.reject(3)
  .finally(() => sleep(3000))
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));
