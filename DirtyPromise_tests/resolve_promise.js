import DirtyPromise from "../DirtyPromise.js";

function sleep(ms) {
  return new Promise((res, _) => setTimeout(res, ms));
}

console.log("--- native Promise ---");
new Promise((res, _) => res(sleep(2000))).then(() =>
  console.log("native Promise.")
);

console.log("--- mini Promise ---");
new DirtyPromise((res, _) => res(sleep(2000))).then(() =>
  console.log("mini Promise.")
);
