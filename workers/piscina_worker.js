export function heavySum({ iterations, multiplier }) {
  let sum = 0;

  for (let i = 0; i < iterations; i++) {
    sum += (Math.sqrt(i) * multiplier) ** 2;
  }

  return sum;
}
