var Promise = require("../P");

var p1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("p1"), 1000);
});

var p2 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("p2"), 2000);
});

var p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
.then(console.log.bind(console));

console.log("finished");

