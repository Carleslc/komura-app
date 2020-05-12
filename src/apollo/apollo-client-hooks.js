import { persistCache } from 'apollo-cache-persist';
import { Platform } from 'quasar';
import { catchUndefined } from '@/utils/errors.js';
import { withAuthAndWebSockets } from './link.js';
import cache from './cache.js';

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
  apolloClient.readQuery = catchUndefined(apolloClient.readQuery.bind(apolloClient));
  app.apolloClient = apolloClient;
}
