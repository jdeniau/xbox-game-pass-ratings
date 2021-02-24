export function average(values) {
  const sum = values.reduce((previous, current) => (current += previous));
  const avg = sum / values.length;

  return avg;
}

export function getStandardDeviation(data) {
  let m = average(data);

  return Math.sqrt(
    data.reduce(function (sq, n) {
      return sq + Math.pow(n - m, 2);
    }, 0) /
      (data.length - 1)
  );
}
