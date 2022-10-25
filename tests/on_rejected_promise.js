import { MiniPromise } from "../mod.js";

function sleep(ms) {
	return new Promise((res, _) => setTimeout(res, ms));
}

new Promise((res, rej) => {
	rej(sleep(3000));
}).then(
	(v) => console.log("---Promise v:", v),
	(e) => console.error("---Promise e:", e)
);

new MiniPromise((res, rej) => {
	rej(sleep(3000));
}).then(
	(v) => console.log("---MiniPromise v:", v),
	(e) => console.error("---MiniPromise e:", e)
);
