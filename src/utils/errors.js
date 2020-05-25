import { report, reportCode, withContext } from '@/boot/sentry';

export function catchUndefined(f) {
  return (...args) => {
    try {
      return f(...args);
    } catch (err) {
      return undefined;
    }
  };
}

export function parseError(callback, context) {
  return ({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions: { code, path } }) => {
        withContext(
          {
            ...context,
            error: {
              code,
              message,
              path
            }
          },
          () => {
            callback(message, code);
          }
        );
      });
    }
  };
}

export function globalErrorHandler() {
  return ({ graphQLErrors, networkError, operation /* forward */ }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions: { code, path } }) => {
        withContext(
          {
            operation: operation.operationName,
            error: {
              code,
              message,
              path
            }
          },
          () => {
            // data-exception
            // validation-failed (permissions, malformed requests...)
            // constraint-violation (e.g. unique key violation)
            // invalid-jwt (e.g. token expired)
            // forward(operation); // retry request
            reportCode(code, message);
          }
        );
      });
    }
    if (networkError) {
      withContext({ operation: operation.operationName }, () => {
        report(networkError);
      });
    }
  };
}
