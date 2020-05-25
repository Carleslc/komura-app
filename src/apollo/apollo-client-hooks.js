import Vue from 'vue';
import AuthService from '@/services/auth';
import { catchUndefined } from '@/utils/errors';
import { withAuthAndWebSockets } from './link.js';
import cache from './cache.js';

export function apolloClientBeforeCreate({ apolloClientConfigObj }) {
  apolloClientConfigObj.link = withAuthAndWebSockets(apolloClientConfigObj.link);
  apolloClientConfigObj.cache.writeData(cache);
}

export function apolloClientAfterCreate({ apolloClient }) {
  Vue.prototype.apollo = apolloClient;
  apolloClient.readQuery = catchUndefined(apolloClient.readQuery.bind(apolloClient));
  AuthService.instance.onApolloReady(apolloClient);
}
