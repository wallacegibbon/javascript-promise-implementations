import Promise from "../DirtyPromise.js";

let a = new Promise((res, _) => setTimeout(res, 2000));

a.then((x) => console.log("A:", x));
a.then((x) => console.log("B:", x));
a.then((x) => console.log("C:", x));
