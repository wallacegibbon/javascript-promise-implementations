Promise = require("../P");

Promise.reject(1)
.then(d => console.log("---", d))
.catch(e => console.error("|||", e));
