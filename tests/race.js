var Promise = require("../P")

var p1 = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("p1"), 3000)
})

var p2 = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("p2"), 2000)
})

var p3 = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("p3"), 1000)
})

Promise.race([p1, p2, p3]).then(console.log)

console.log("finished")

