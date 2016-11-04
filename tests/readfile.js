var fs = require("fs");

var Promise = require("../P");

new Promise((resolve, reject) => {
  fs.readFile("/tmp/a.txt", (e, d) => e ? reject(e) : resolve(d));
})
.then((d) => {
  console.log("raw result:\n", d, "\nparsed result:\n", d.toString())
})
.catch((e) => {
  console.log("**** failed reading file ****");
  console.log("reason:", e.message);
});


