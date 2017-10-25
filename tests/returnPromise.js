const Promise = require("..");


function delay(milliseconds) {
  return new Promise((res, _) => setTimeout(res, milliseconds));
}

Promise.resolve(1)
.then(() => delay(1000))
.then(() => console.log("Last then"));
