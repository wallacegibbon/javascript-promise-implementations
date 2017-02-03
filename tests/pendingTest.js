var fs = require("fs")
Promise = require("../P")

function myReadFile(fileName) {
	return new Promise((res, rej) => {
		fs.readFile(fileName, (e, d) => e ? rej(e) : res(d.toString()))
	})
}

var x = myReadFile("/tmp/a.txt")

console.log("before 'then'")

setTimeout(() => x.then(console.log).catch(console.error), 3000)

console.log("after 'then'")
