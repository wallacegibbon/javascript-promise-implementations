import Promise from "../DirtyPromise.js";

let p1 = new Promise((res, _) => setTimeout(() => res("p1"), 2000));
let p2 = new Promise((res, _) => setTimeout(() => res("p2"), 3000));
let p3 = new Promise((_, rej) => setTimeout(() => rej("p3"), 1000));
let p4 = new Promise((_, rej) => setTimeout(() => rej("p4"), 4000));

Promise.all([p1, p2, p3]).then(
  (r) => console.log(`Promise.all result: ${r}`),
  (e) => console.error(`Promise.all error: ${e}`),
);

Promise.all([p1, p2]).then(
  (r) => console.log(`Promise.all result: ${r}`),
  (e) => console.error(`Promise.all error: ${e}`),
);

Promise.race([p1, p2, p3]).then(
  (r) => console.log(`Promise.race result: ${r}`),
  (e) => console.error(`Promise.race error: ${e}`),
);

Promise.any([p1, p2, p3]).then(
  (r) => console.log(`Promise.any result: ${r}`),
  (e) => console.error(`Promise.any error: ${e}`),
);

Promise.any([p3, p4]).then(
  (r) => console.log(`Promise.any result: ${r}`),
  (e) => console.error(`Promise.any error: ${e}`),
);

console.log("...");
