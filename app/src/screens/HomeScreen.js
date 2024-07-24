import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_ALL_POSTS } from "../queries/posts";
import Post from "../components/Post";


export default function HomeScreen() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_POSTS);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BBA9D4" />
      </View>
    ); 
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={data.getAllPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post item={item} />}
        style={styles.container}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#0D0F1B",
    fontSize: 18,
  },
});
