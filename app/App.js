import React from "react";
import MainStack from "./src/navigators/MainStack";
import AuthProvider from "./src/contexts/authContext";
import { ApolloProvider } from "@apollo/client";
import client from "./src/config/apollo";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <MainStack />
      </AuthProvider>
    </ApolloProvider>
  );
}
