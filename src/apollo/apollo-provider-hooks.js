export function apolloProviderBeforeCreate({ apolloProviderConfigObj }) {
  apolloProviderConfigObj.defaultOptions = {
    $query: {
      loadingKey: 'loading'
    }
  };
}

// eslint-disable-next-line max-len
export function apolloProviderAfterCreate(/* { apolloProvider, app, router, store, ssrContext, urlPath, redirect } */) {}
