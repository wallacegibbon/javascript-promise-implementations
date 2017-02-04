var Promise = require("../P")

var p1 = new Promise(function (resolve, reject) {
	setTimeout(() => resolve("p1"), 3000)
})

var p2 = new Promise(function (resolve, reject) {
	setTimeout(() => resolve("p2"), 2000)
})

var p3 = new Promise(function (resolve, reject) {
	setTimeout(() => resolve("p3"), 1000)
})

var x = Promise.race([p1, p2, p3])

x.then(console.log)

console.log("start...")

setTimeout(() => x.then(console.log), 4000)
