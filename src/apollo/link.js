import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { split } from 'apollo-link';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';

import { fetchAuthHeader } from '@/services/auth';
import { globalErrorHandler } from '@/utils/errors';

const onServer = process.env.SERVER;

const API = 'komura-backend.herokuapp.com/v1/graphql';

// 'apollo-link-http' config
// https://www.apollographql.com/docs/link/links/http/#options

const httpLinkConfig = {
  uri: `https://${API}`,
  fetch: onServer ? require('node-fetch') : undefined
};

const wsClient = new SubscriptionClient(
  `wss://${API}`,
  {
    reconnect: true
  },
  onServer ? require('websocket') : undefined
);

const wsLink = new WebSocketLink(wsClient);

const authLink = setContext(async (request, { headers }) => {
  const contextHeaders = { ...headers };

  const authHeader = await fetchAuthHeader();

  if (authHeader) {
    contextHeaders.Authorization = authHeader;
  }

  return {
    headers: contextHeaders
  };
});

const errorLink = onError(globalErrorHandler());

export { httpLinkConfig };

export function withAuthAndWebSockets(httpLink) {
  return errorLink.concat(
    authLink.concat(
      split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink
      )
    )
  );
}

export function restartWebsockets() {
  // Copy current operations
  const operations = { ...wsClient.operations };

  // Restart connection
  wsClient.close(true);
  wsClient.connect();

  // Push all current operations to the new connection
  Object.keys(operations).forEach(id => {
    wsClient.sendMessage(id, MessageTypes.GQL_START, operations[id].options);
  });
}
