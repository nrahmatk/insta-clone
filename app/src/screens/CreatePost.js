import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { CREATE_POST } from "../queries/posts";

export default function CreatePost() {
  const navigation = useNavigation();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [inputError, setInputError] = useState("");

  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    onCompleted: (data) => {
      setContent("");
      setTags("");
      setImgUrl("");
      navigation.navigate("Home");
    },
    onError: (error) => {
      // console.error("Error creating post:", error);
    },
  });

  const contentInputRef = useRef(null);
  const tagsInputRef = useRef(null);
  const imgUrlInputRef = useRef(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (contentInputRef.current) {
          contentInputRef.current.blur();
        }
        if (tagsInputRef.current) {
          tagsInputRef.current.blur();
        }
        if (imgUrlInputRef.current) {
          imgUrlInputRef.current.blur();
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    const input = {
      content,
      tags: tags
        .split(" ")
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag.trim()}`)),
      imgUrl,
    };

    await createPost({ variables: { input } });
  };

  const handleTagsChange = (text) => {
    const formattedTags = text
      .split(" ")
      .map((word) => (word.startsWith("#") ? word : `#${word}`))
      .join(" ");
    setTags(formattedTags);
    setInputError("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>
      <TextInput
        ref={contentInputRef}
        style={styles.input}
        placeholder="Content"
        value={content}
        onChangeText={(text) => {
          setContent(text);
          setInputError("");
        }}
      />
      <TextInput
        ref={tagsInputRef}
        style={styles.input}
        placeholder="Tags (separated by spaces)"
        value={tags}
        onChangeText={handleTagsChange}
      />
      <TextInput
        ref={imgUrlInputRef}
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
          <Text style={styles.buttonText}>Create Post</Text>
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
  error: {
    textAlign: "center",
    marginTop: 10,
    color: "#0D0F1B",
  },
});
