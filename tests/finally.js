import MiniPromise from "../mod.js";

function sleep(milliseconds) {
  return new Promise((res, _rej) => setTimeout(res, milliseconds));
}

MiniPromise.resolve(3).finally(() => sleep(3000))
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));

MiniPromise.reject(3).finally(() => sleep(3000))
  .then(d => console.log(`data: ${d}`), e => console.error(`error: ${e}`));
