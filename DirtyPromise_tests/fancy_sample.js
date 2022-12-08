import DirtyPromise from "../DirtyPromise.js";

function fancy(promise_class) {
  console.log(`>>>>>> example of ${promise_class.name}`);
  Promise.resolve().then(() => {
    console.log(0);
    // return 4;
    return Promise.resolve(4);
  }).then(res => {
    console.log(res)
  })

  Promise.resolve().then(() => {
    console.log(1);
  }).then(() => {
    console.log(2);
  }).then(() => {
    console.log(3);
  }).then(() => {
    console.log(5);
  }).then(() => {
    console.log(6);
  })

  setTimeout(() => {
    console.log("timer fn");
  });

  console.log("start");
}

fancy(Promise);
await new Promise((res, _) => setTimeout(res, 500));
fancy(DirtyPromise);
