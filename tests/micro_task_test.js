import { MiniPromise } from "../mod.js";

async function test_promise(promise_class) {
  console.log(`[${promise_class.name}] start`);

  new promise_class((res, _rej) => {
    console.log(`[${promise_class.name}] emmm...`);
    res();
  }).then(() => {
    console.log(`[${promise_class.name}] then`);
  });

  console.log(`[${promise_class.name}] end`);
}

test_promise(Promise);
await new Promise((res, _) => setTimeout(res, 1000));
test_promise(MiniPromise);
