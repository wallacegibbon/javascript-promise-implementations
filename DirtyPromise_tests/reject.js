import Promise from "../DirtyPromise.js";

Promise.reject(1)
  .then((d) => console.log("---", d))
  .catch((e) => console.error("|||", e));
