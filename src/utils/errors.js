export function catchUndefined(f) {
  return (...args) => {
    try {
      return f(...args);
    } catch (err) {
      return undefined;
    }
  };
}
