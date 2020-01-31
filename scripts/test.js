const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13];




console.log(JSON.stringify(res, null, ''));
console.log(res.reduce((s, v) => s + v, 0) === arr.reduce((s, v) => s + v, 0) * repeats);