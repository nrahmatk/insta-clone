import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { GET_USER_BY_ID } from "../queries/user";
import { CREATE_FOLLOW, UNFOLLOW } from "../queries/follow";
import { authContext } from "../contexts/authContext";
import { Feather } from "@expo/vector-icons";

export default function MyProfileScreen() {
  const [activeTab, setActiveTab] = useState("posts");
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const { usernameLogin, logout } = useContext(authContext);

  const { loading, error, data, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { getUserByIdId: usernameLogin }, // Menggunakan usernameLogin sebagai ID
    onCompleted: (data) => {
      const isUserFollowing = data.getUserById.followers.some(
        (follower) => follower.username === usernameLogin
      );
      setIsFollowing(isUserFollowing);
    },
  });
  
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.headerButton}>
          <Feather name="log-out" size={18} color="#000" />
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3897f0" />
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

  const user = data.getUserById;

  const renderContent = () => {
    if (activeTab === "posts") {
      return (
        <FlatList
          key="posts"
          data={user.posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Post", { postId: item._id })}
              style={styles.grid}
            >
              <Image source={{ uri: item.imgUrl }} style={styles.postImage} />
            </TouchableOpacity>
          )}
          numColumns={3}
          style={styles.posts}
        />
      );
    } else if (activeTab === "followers") {
      return (
        <View style={styles.StatFollow}>
          <FlatList
            key="followers"
            data={user.followers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", { userId: item._id })
                }
                style={styles.userRow}
              >
                <Image
                  source={{
                    uri:
                      item.imgUrl ||
                      `https://ui-avatars.com/api/?name=${item.username}&background=5b5cae&color=fff&font-size=0.33`,
                  }}
                  style={styles.avatarSmall}
                />
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    } else if (activeTab === "following") {
      return (
        <View style={styles.StatFollow}>
          <FlatList
            key="following"
            data={user.following}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", { userId: item._id })
                }
                style={styles.userRow}
              >
                <Image
                  source={{
                    uri:
                      item.imgUrl ||
                      `https://ui-avatars.com/api/?name=${item.username}&background=5b5cae&color=fff&font-size=0.33`,
                  }}
                  style={styles.avatarSmall}
                />
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    }
  };

  const handleFollow = async () => {
    if (isFollowing) {
      await deleteFollow({
        variables: {
          followingId: user._id,
        },
      });
      setIsFollowing(false);
    } else {
      await createFollow({
        variables: {
          followingId: user._id,
        },
      });
      setIsFollowing(true);
    }
    refetch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user.imgUrl ||
              `https://ui-avatars.com/api/?name=${user.username}&background=5b5cae&color=fff&font-size=0.33`,
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
        <View style={styles.headerOption}>
          <View style={styles.headerOptionContent}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.stats}>
        <TouchableOpacity
          style={[styles.stat, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <Text style={styles.statNumber}>{user.posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stat, activeTab === "followers" && styles.activeTab]}
          onPress={() => setActiveTab("followers")}
        >
          <Text style={styles.statNumber}>{user.followers.length}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stat, activeTab === "following" && styles.activeTab]}
          onPress={() => setActiveTab("following")}
        >
          <Text style={styles.statNumber}>{user.following.length}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#0d0f1b",
    fontWeight: "bold",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    fontSize: 16,
    color: "gray",
  },
  bio: {
    fontSize: 14,
    marginTop: 5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    // marginBottom: 5,
    borderBottomWidth: 0.7,
    borderBottomColor: "#ddd",
    paddingBottom: 15,
    marginHorizontal: 10,
  },
  stat: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  StatFollow: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#9F79BD",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "gray",
  },
  posts: {
    flex: 1,
  },
  grid: {
    width: "33%",
  },
  postImage: {
    aspectRatio: 1,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
    fontSize: 16,
  },
  headerOption: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  headerOptionContent: {
    alignItems: "center",
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
