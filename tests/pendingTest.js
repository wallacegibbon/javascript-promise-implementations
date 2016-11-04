var fs = require("fs");
Promise = require("../P");

function myReadFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (e, d) => e ? reject(e) : resolve(d.toString()));
  });
}

var x = myReadFile("/tmp/a.txt");

setTimeout(() => x.then(console.log), 3000);

