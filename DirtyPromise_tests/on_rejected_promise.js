import DirtyPromise from "../DirtyPromise.js"

function sleep(ms) {
  return new Promise((res, _) => setTimeout(res, ms))
}

new Promise((res, rej) => rej(sleep(3000)))
  .then(
    (v) => console.log("---Promise v:", v),
    (e) => console.error("---Promise e:", e)
  )

new DirtyPromise((res, rej) => rej(sleep(3000)))
  .then(
    (v) => console.log("---DirtyPromise v:", v),
    (e) => console.error("---DirtyPromise e:", e)
  )
