const fs = require("fs");
const Promise = require("..");

function readFile(fileName) {
  return new Promise((res, rej) => {
    fs.readFile(fileName, (e, d) => e ? rej(e) : res(d.toString()));
  })
}

setTimeout(() => readFile("./pendingTest.js").then(console.log, console.error),
           3000);

console.log("...");
