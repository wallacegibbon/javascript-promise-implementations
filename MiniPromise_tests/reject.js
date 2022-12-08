import Promise from "../MiniPromise.js";

Promise.reject(1)
  .then(d => console.log("---", d))
  .catch(e => console.error("|||", e));
