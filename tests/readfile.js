var fs = require("fs");

var Promise = require("../P");

var f = "/tmp/a.txt";

new Promise((res, rej) => fs.readFile(f, (e, d) => e ? rej(e) : res(d)))
.then(d => console.log("raw:\n", d, "\ndecoded:\n", d.toString()))
.catch(e => console.error(`failed:${e.message}`));


