import { MiniPromise as Promise } from "../mod.js";

Promise.reject(1)
	.then((d) => console.log("---", d))
	.catch((e) => console.error("|||", e));
