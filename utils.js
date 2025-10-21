function factorial(n) {
  if (!Number.isInteger(n)) {
    throw new TypeError('Factorial only defined for integers');
  }

  if (n < 0) {
    throw new Error('Factorial not defined for negative numbers');
  }

  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }

  return result;
}

module.exports = { factorial };
