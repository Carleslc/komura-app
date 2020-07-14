export function filter(o, keys) {
  return Object.keys(o)
    .filter(key => keys.includes(key))
    .reduce((obj, key) => {
      obj[key] = o[key];
      return obj;
    }, {});
}

export function override(defaults, data) {
  return {
    ...defaults,
    ...Object.keys(data)
      .filter(key => key in defaults)
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {})
  };
}
