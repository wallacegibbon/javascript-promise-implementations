import DirtyPromise from "../DirtyPromise.js";

async function test_1(promise_class) {
  console.log(`[${promise_class.name}] test1 start`);

  new promise_class((res, _rej) => {
    console.log(`[${promise_class.name}] test1 emmm...`);
    res();
  }).then(() => {
    console.log(`[${promise_class.name}] test1 then`);
  });

  console.log(`[${promise_class.name}] test1 end`);
}

async function test_2(promise_class) {
  console.log(`[${promise_class.name}] test2 start`);

  let res1;
  new promise_class((res, _rej) => {
    console.log(`[${promise_class.name}] test2 emmm...`);
    res1 = res;
  }).then(() => {
    console.log(`[${promise_class.name}] test2 then`);
  });

  res1();
  console.log(`[${promise_class.name}] test2 end`);
}

test_1(Promise);
await new Promise((res, _) => setTimeout(res, 500));
test_1(DirtyPromise);
await new Promise((res, _) => setTimeout(res, 500));
test_2(Promise);
await new Promise((res, _) => setTimeout(res, 500));
test_2(DirtyPromise);
