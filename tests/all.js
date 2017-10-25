function log() {
  console.log.bind(null, "---").apply(console, arguments);
}

function error() {
  console.error.bind(null, "***").apply(console, arguments);
}

const Promise = require("..");

const p1 = new Promise((res, _) => setTimeout(() => res("p1"), 1000));
const p2 = new Promise((res, _) => setTimeout(() => res("p2"), 2000));
const p3 = Promise.resolve(3);
//const p3 = Promise.reject(3);

Promise.all([ p1, p2, p3 ]).then(log, error);

console.log("...");

