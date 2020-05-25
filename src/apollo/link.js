import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { split } from 'apollo-link';
import { w3cwebsocket } from 'websocket';
import fetch from 'node-fetch';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';

import AuthService from '@/services/auth';

const onServer = process.env.SERVER;

const API = 'komura-backend.herokuapp.com/v1/graphql';

// 'apollo-link-http' config
// https://www.apollographql.com/docs/link/links/http/#options

const httpLinkConfig = {
  uri: `https://${API}`,
  fetch: onServer ? fetch : undefined
};

const wsClient = new SubscriptionClient(
  `wss://${API}`,
  {
    reconnect: true
  },
  onServer ? w3cwebsocket : undefined
);

const wsLink = new WebSocketLink(wsClient);

const authLink = setContext(async (request, { headers }) => {
  const contextHeaders = { ...headers };

  const authHeader = await AuthService.instance.fetchAuthHeader();

  if (authHeader) {
    contextHeaders.Authorization = authHeader;
  }

  return {
    headers: contextHeaders
  };
});

const errorLink = onError(({ graphQLErrors, networkError /* operation, forward */ }) => {
  if (process.env.DEV) {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.error(extensions.code, message);
        switch (extensions.code) {
          case 'data-exception':
          case 'validation-failed':
            // Something went wrong (permissions, malformed requests...)
            break;
          case 'constraint-violation':
            // e.g. unique key violation
            break;
          case 'invalid-jwt':
            // forward(operation); // retry request
            break;
          default:
            break;
        }
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  }
});

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
