import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_USER_BY_NAME_OR_USERNAME } from "../queries/user";
import { useNavigation } from "@react-navigation/native";

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error } = useQuery(GET_USER_BY_NAME_OR_USERNAME, {
    variables: { identifier: searchTerm },
    skip: searchTerm.length === 0,
  });

  const textInputRef = useRef(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (textInputRef.current) {
          textInputRef.current.blur();
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => navigation.navigate("Profile", { userId: item._id })}
    >
      <Image
        source={{
          uri:
            item.imgUrl ||
            `https://ui-avatars.com/api/?name=${item.username}&background=5b5cae&color=fff&font-size=0.33`,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        ref={textInputRef}
        style={styles.searchBar}
        placeholder="Cari berdasarkan username atau nama"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      {data && (
        <FlatList
          data={data.getUserByNameOrUsername}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 40,
    borderColor: "#BBA9D4",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  bio: {
    color: "gray",
    marginTop: 5,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "#0D0F1B",
  },
});
