const MiniPromise = require('..')

function delay(ms)
{
	return new Promise((res, _) => setTimeout(res, ms))
}

async function delay2(ms)
{
	return (
		new Promise((res1, _) =>
			res1(new Promise((res2, _) => setTimeout(res2, ms))))
	)
}

Promise.resolve(1)
	.then(() => delay2(2000))
	.then(v => console.log("Promise", v), e => console.error('*e:', e))

MiniPromise.resolve(1)
	.then(() => delay2(2000))
	.then(v => console.log("MiniPromise", v), e => console.error('*e:', e))
