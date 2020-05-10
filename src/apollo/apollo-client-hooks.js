import { withAuthAndWebSockets } from './link.js';

export function apolloClientBeforeCreate({ apolloClientConfigObj }) {
  apolloClientConfigObj.link = withAuthAndWebSockets(apolloClientConfigObj.link);
  // apolloClientConfigObj.cache
}

export function apolloClientAfterCreate(/* { apolloClient, app, router, store, ssrContext, urlPath, redirect } */) {}
