const { add } = require('./lib/add');
const { multiply } = require('./lib/multiply');
require('./lib/divide');
require('./lib/patch');

const A = 10;
const B = 2;

const result1 = add(A, B);
const result2 = multiply(A, B);
const result3 = divide(A, B);

console.log('add', result1);
console.log('multiply', result2);
console.log('divide', result3);
