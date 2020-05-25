export function catchUndefined(f) {
  return (...args) => {
    try {
      return f(...args);
    } catch (err) {
      return undefined;
    }
  };
}

export function parseError(callback) {
  return ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        callback(message, extensions.code);
      });
    }
    if (networkError) {
      callback(networkError);
    }
  };
}
