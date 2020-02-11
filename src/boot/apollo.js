import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { split } from 'apollo-link';

import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import fetch from 'node-fetch';
import VueApollo from 'vue-apollo';

import { AuthService } from '@/services/auth';

// https://github.com/Akryum/vue-cli-plugin-apollo/blob/master/graphql-client/src/index.js

const API = 'komura-backend.herokuapp.com/v1/graphql';

const httpLink = new HttpLink({
  uri: `https://${API}`,
  fetch
});

const wsClient = new SubscriptionClient(`wss://${API}`, {
  reconnect: true
});

const wsLink = new WebSocketLink(wsClient);

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: AuthService.getAuth()
    }
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.DEV
});

export function restartWebsockets() {
  // Copy current operations
  const operations = { ...wsClient.operations };

  // Close connection
  wsClient.close(true);

  // Open a new one
  wsClient.connect();

  // Push all current operations to the new connection
  Object.keys(operations).forEach(id => {
    wsClient.sendMessage(id, MessageTypes.GQL_START, operations[id].options);
  });
}

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  },
  errorHandler({ graphQLErrors, networkError }) {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
});

export default ({ app, Vue }) => {
  Vue.use(VueApollo);
  app.apolloProvider = apolloProvider;
};
