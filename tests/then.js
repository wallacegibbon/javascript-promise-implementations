// Whatever the callback of `then` returns, it will be wrapped into a Promise
// `then` will always return a new Promise object.

const Promise = require("..")

const a = new Promise((resolve) => resolve(100))
const b = a.then((value) => console.log("value is", value))
const c = b.catch((e) => console.error(e))

console.log("a is:", a, ",\nb is:", b, ",\nc is:", c)

console.log(a === b)
console.log(b === c)
