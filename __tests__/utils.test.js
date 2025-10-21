const { factorial } = require('../utils');

describe('factorial', () => {
  it('returns 1 for the base cases 0 and 1', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
  });

  it('computes factorial for positive integers', () => {
    expect(factorial(5)).toBe(120);
    expect(factorial(7)).toBe(5040);
  });

  it('throws on negative input', () => {
    expect(() => factorial(-3)).toThrow('Factorial not defined for negative numbers');
  });
});
