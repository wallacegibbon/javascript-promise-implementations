import * as promise from "./closure_promise.ts";

let sleep = milliseconds => promise.create((res, _) => setTimeout(res, milliseconds));

console.log("before sleep.");
await sleep(1000);
console.log("after sleep.");

try {
  await promise.reject("blah")
    .finally(() => console.log("caught blah"));

  console.log("this should not be executed.");
} catch (e) {
  console.error(">>>", e);
}

console.log("testing all...");
let r1 = await promise.all([sleep(1000), sleep(2000), sleep(3000)]);
console.log("result of all:", r1);

console.log("testing race...");
let r2 = await promise.race([sleep(1000), sleep(2000), sleep(3000)]);
console.log("result of race:", r2);
