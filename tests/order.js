var Promise = require("../P");

new Promise((resolve) => {
  // expressions in this function will be executed immediately
  console.log("in the fn passed to Promise");
  setTimeout(() => resolve(1), 500);
})
.then((value) => {
  // expressions in this function will be executed asynchronous
  console.log("then part, value is", value);
});

console.log("outter");

