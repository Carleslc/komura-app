import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from 'apollo-link-context';
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

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: AuthService.instance.header
    }
  };
});

export { httpLinkConfig };

export function withAuthAndWebSockets(httpLink) {
  return authLink.concat(
    split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink
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
