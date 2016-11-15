var fs = require("fs");
Promise = require("../P");

function myReadFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (e, d) => e ? reject(e) : resolve(d.toString()));
  });
}

var x = myReadFile("/tmp/a.txt");

console.log("before 'then'");

setTimeout(() => x.then(console.log).catch(console.error), 3000);

