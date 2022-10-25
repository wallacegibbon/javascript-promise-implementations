export class MiniPromise {

/// A Promise is nothing more than an object that holds some states and wraps
/// the callback to make it looks better.
///
/// promise.then(fn1, fn2) may get called for multiple times, use array to
/// store those functions.
///
/// @param {Function} fn
constructor(fn) {
	if (!is_function(fn))
		throw new TypeError(
			"constructor argument have to be a function"
		);

	this.status = "pending";
	this.fulfilled_fns = [];
	this.rejected_fns = [];
	const res = this.on_fulfilled.bind(this);
	const rej = this.on_rejected.bind(this);
	fn(res, rej);
}

/// If `val` is a Promise Object, it will be unwrapped recursively.
on_fulfilled(val) {
	if (is_thenable(val))
		return val.then(
			this.on_fulfilled.bind(this),
			this.on_rejected.bind(this)
		);

	if (this.status !== "pending")
		throw new Error(`on_fulfilled was called multiple times`);

	this.status = "fulfilled";
	this.val = val;

	var fn;
	while ((fn = this.fulfilled_fns.shift()))
		fn(val);
}

/// Unlike `val`, when `err` is a Promise Object, it will not be unwrapped as
/// this is not how Promise should be used.
/// The built-in Promise will pass it to rejected_fns directly.
/// To make things clear, my implementation will reject a clearer information.
on_rejected(err) {
	if (this.status !== "pending")
		throw new Error(`on_rejected was called multiple times`);

	if (is_thenable(err))
		this.err = "on_rejected does not accept Promise argument";
	else
		this.err = err;

	this.status = "rejected";
	let fn;
	while ((fn = this.rejected_fns.shift()))
		fn(err);
}

/// `promise.then` is the most important method for Promise. It's the key to
/// hold a Promise chain.
///
/// If res_fn or rej_fn is not function, just ignore them, and pass value of
/// the previous promise directly to the next promise. Just like you didn't
/// write this `then`.
then(res_fn, rej_fn) {
	return new MiniPromise((res, rej) => {
		const { real_res_fn, real_rej_fn } = this.make_then_help_fns(
			res_fn, rej_fn, res, rej
		);
		switch (this.status) {
		case "pending":
			this.fulfilled_fns.push(real_res_fn);
			this.rejected_fns.push(real_rej_fn);
			break;
		case "fulfilled":
			real_res_fn(this.val);
			break;
		case "rejected":
			real_rej_fn(this.err);
			break;
		}
	});
}

make_then_help_fns(res_fn, rej_fn, res, rej) {
	const hook_next = (r) => {
		if (is_thenable(r)) r.then(res, rej);
		else res(r);
	};
	/// Since the argument `val` comes from `on_fulfilled`,
	/// it will never be a Promise object.
	/// (on_fulfilled unwrapped Promise recursively)
	const real_res_fn = (val) => {
		if (!is_function(res_fn))
			return res(val);

		try { hook_next(res_fn(val)); }
		catch (e) { rej(e); }
	};
	const real_rej_fn = (err) => {
		if (!is_function(rej_fn))
			return rej(err);

		try { hook_next(rej_fn(err)); }
		catch (e) { rej(e); }
	};

	return { real_res_fn, real_rej_fn };
}

/// `promise.catch(rej_fn)` is nothing but `promise.then(null, rej_fn)`
catch(rej_fn) {
	return this.then(null, rej_fn);
}

/// Execute an array of Promise objects, collect all result(call `then`) and
/// return them in an array.
///
/// But if any one of the objects triggered reject, just ignore the result
/// and reject directly.
static all(promise_array) {
	if (!Array.isArray(promise_array))
		throw new TypeError(
			"Promise.all need Array object as argument"
		);

	return new MiniPromise((res, rej) => {
		let count = promise_array.length;
		const result = [];
		const handler_of = idx => v => {
			result[idx] = v;
			if (--count === 0)
				res(result);
		};
		promise_array.forEach(
			(p, idx) => p.then(handler_of(idx), rej)
		);
	});
}

/// Execute an array of Promise objects, only return the result of the one
/// who call `then` first.
static race(promise_array) {
	if (!Array.isArray(promise_array))
		throw new TypeError(
			"Promise.race need Array object as argument"
		);

	return new MiniPromise((res, rej) =>
		promise_array.forEach((p) => p.then(res, rej))
	);
}

static any(promise_array) {
	if (!Array.isArray(promise_array))
		throw new TypeError(
			"Promise.any need Array object as argument"
		);

	return new MiniPromise((res, rej) => {
		let count = promise_array.length;
		const rej_handler = e => {
			if (--count === 0)
				rej(e);
		};
		promise_array.forEach(
			(p) => p.then(res, rej_handler)
		);
	});
}

/// If you need to start a Promise chain from a basic value, just use this.
/// e.g. Promise.resolve(1).then(console.log)
static resolve(v) {
	return new MiniPromise((res, _) => res(v));
}

/// Just like Promise.resolve, but start with an rejection.
static reject(v) {
	return new MiniPromise((_, rej) => rej(v));
}

} // class MiniPromise


function is_thenable(obj) {
	return obj && is_function(obj.then);
}


function is_function(obj) {
	return typeof obj === "function";
}


