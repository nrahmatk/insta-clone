import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { TextInput } from "react-native";
import { useMutation } from "@apollo/client";
import { authContext } from "../contexts/authContext";
import * as SecureStore from "expo-secure-store";
import { LOGIN_MUTATION } from "../queries/user";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [login, { data, loading }] = useMutation(LOGIN_MUTATION);
  const { setIsSignedIn, setUsernameLogin } = useContext(authContext);

  const handleLogin = async () => {
    try {
      const { data } = await login({
        variables: { input: { identifier, password } },
      });
      await SecureStore.setItemAsync("access_token", data.login.access_token);
      await SecureStore.setItemAsync("username", data.login.username);
      setUsernameLogin(data.login.username);
      setIsSignedIn(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Instagram</Text>

      <TextInput
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        autoCapitalize="none"
        autoFocus={true}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {error && (
        <Modal transparent={true} animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Feather name="alert-circle" size={24} color="#9F79BD" />
              <Text style={styles.modalText}>{error}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setError(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0d0f1b",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#bba9d4",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#5b5cae",
    width: "100%",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerText: {
    color: "#0D0F1B",
    marginTop: 20,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: "0D0F1B",
    textAlign: "center",
    marginVertical: 15,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#5B5CAE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
