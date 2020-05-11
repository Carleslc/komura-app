import { persistCache } from 'apollo-cache-persist';
import { Platform } from 'quasar';
import cache from './cache.js';
import { withAuthAndWebSockets } from './link.js';

export function apolloClientBeforeCreate({ apolloClientConfigObj }) {
  apolloClientConfigObj.link = withAuthAndWebSockets(apolloClientConfigObj.link);
  apolloClientConfigObj.cache.writeData(cache);

  if (Platform.is.desktop) {
    persistCache({
      cache: apolloClientConfigObj.cache,
      storage: window.localStorage
    });
  }
}

export function apolloClientAfterCreate({ apolloClient, app }) {
  app.apolloClient = apolloClient;
}
