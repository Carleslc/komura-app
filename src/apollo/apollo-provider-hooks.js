export function apolloProviderBeforeCreate({ apolloProviderConfigObj }) {
  apolloProviderConfigObj.defaultOptions = {
    $query: {
      loadingKey: 'loading'
    }
  };

  if (process.env.DEV) {
    apolloProviderConfigObj.errorHandler = function errorHandler({ graphQLErrors, networkError }) {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    };
  }
}

// eslint-disable-next-line max-len
export function apolloProviderAfterCreate(/* { apolloProvider, app, router, store, ssrContext, urlPath, redirect } */) {}
