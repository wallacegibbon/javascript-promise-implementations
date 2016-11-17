/**
 * The flow:
 *                _________    ........
 *    taskA       |resolve|    .reject.
 *                    |           |
 *                ____|____    ...|....
 *    taskA       |resolve|    .reject.
 *                    |           |
 *                ....|....    ___|____
 *    onReject1   .resolve.    |reject|
 *                    |           |
 *                ____|____    ...|....
 *    taskA       |resolve|    .reject.
 *                    |           |
 *                ....|....    ___|____
 *    onReject2   .resolve.    |reject|
 *                    |           |
 *                ____|____    ...|....
 *    taskD       |resolve|    .reject.
 *
 */

var Promise = require("../P")

function taskA(v) {
  console.log("taskA, arg:", v)
  //return Promise.reject("error in taskA")
  throw new Error("error in taskA")
}

function taskB(v) {
  console.log("taskB, arg:", v)
  return v
}

function onReject1(e) {
  console.log("onReject1:", e.toString())
  //return Promise.resolve("reset") // this works, too
  return "reset"
}

function taskC(v) {
  console.log("taskC, arg:", v)
  // if throw Error here, will be caught by onReject2, not onReject1
  return Promise.reject("error in taskC")
}

function onReject2(e) {
  console.log("onReject2:", e.toString())
  return "reset"
}

function taskD(v) {
  console.log("taskD, arg:", v)
  return v
}

Promise.resolve(1)
.then(taskA)
.then(taskB)
.catch(onReject1)
.then(taskC)
.catch(onReject2)
.then(taskD)
.catch(console.error)

console.log("last line")

