import { httpLinkConfig } from './link.js';

export default function(/* { app, router, store, ssrContext, urlPath, redirect } */) {
  return {
    default: {
      httpLinkConfig,

      // 'apollo-cache-inmemory' config
      // https://www.apollographql.com/docs/react/caching/cache-configuration/#configuring-the-cache
      cacheConfig: {},

      // additional config for apollo client
      // https://github.com/apollographql/apollo-client/blob/version-2.6/docs/source/api/apollo-client.mdx#optional-fields
      additionalConfig: {}
    },

    // you can add more options or override the default config for a specific
    // quasar mode or for dev and prod modes

    dev: {
      additionalConfig: {
        connectToDevTools: true
      }
    },

    prod: {
      additionalConfig: {
        connectToDevTools: false
      }
    },

    // ssr: {},

    // the following gets merged to the config only when using ssr and on server
    ssrOnServer: {
      additionalConfig: {
        // https://apollo.vuejs.org/guide/ssr.html#create-apollo-client
        ssrMode: true
      }
    },

    // the following gets merged to the config only when using ssr and on client
    ssrOnClient: {
      additionalConfig: {
        // https://apollo.vuejs.org/guide/ssr.html#create-apollo-client
        ssrForceFetchDelay: 100
      }
    }
  };
}
