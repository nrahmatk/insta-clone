import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { EDIT_USER, GET_USER_BY_ID } from "../queries/user";
import { authContext } from "../contexts/authContext";

export default function EditProfile() {
  const { setUsernameLogin, usernameLogin } = useContext(authContext);
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [inputError, setInputError] = useState("");

  const { data, loading: loadingUser, error: errorUser, refetch } = useQuery(GET_USER_BY_ID);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (data) {
        setName(data.getUserById.name);
        setUsername(data.getUserById.username);
        setEmail(data.getUserById.email);
        setBio(data.getUserById.bio);
        setImgUrl(data.getUserById.imgUrl);
      }
    }, [data])
  );

  const [editUser, { loading, error }] = useMutation(EDIT_USER, {
    onError: (error) => {
      console.error("Error editing profile:", error);
    },
    onCompleted: () => {
      refetch();
    }
  });

  const handleSubmit = async () => {
    const input = {
      name,
      username,
      email,
      bio,
      imgUrl,
    };
    await editUser({ variables: { input } });
    await SecureStore.setItemAsync("username", username);
    setUsernameLogin(username);
    navigation.goBack();
  };

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setInputError("");
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setInputError("");
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setInputError("");
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={(text) => {
          setBio(text);
          setInputError("");
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={imgUrl}
        onChangeText={(text) => {
          setImgUrl(text);
          setInputError("");
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
      {inputError ? <Text style={styles.error}>{inputError}</Text> : null}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#BBA9D4",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#5B5CAE",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  error: {
    textAlign: "center",
    marginTop: 10,
    color: "#0D0F1B",
  },
});
