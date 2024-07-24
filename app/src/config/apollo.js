import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import * as SecureStorage from "expo-secure-store";

const httpLink = new createHttpLink({
  uri: "https://c30f-104-28-247-132.ngrok-free.app",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStorage.getItemAsync("access_token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Post: {
      fields: {
        likes: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});


const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
  // cache: new InMemoryCache(),
});

export default client;
