import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import {
  MUTATION_ADD_COMMENT,
  MUTATION_ADD_LIKE,
  MUTATION_REMOVE_LIKE,
} from "../queries/posts";
import { useMutation } from "@apollo/client";
import { authContext } from "../contexts/authContext";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";

export default function Post({ item }) {
  const navigation = useNavigation();
  const { usernameLogin } = useContext(authContext);
  const [showMore, setShowMore] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(item.comments);
  const [likes, setLikes] = useState(item.likes);
  const [loading, setLoading] = useState(false);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [addComment] = useMutation(MUTATION_ADD_COMMENT);
  const [addLike] = useMutation(MUTATION_ADD_LIKE);
  const [removeLike] = useMutation(MUTATION_REMOVE_LIKE);
  const [isLikesModalVisible, setLikesModalVisible] = useState(false);

  const textInputRef = useRef(null);

  useEffect(() => {
    const calculateTimeAgo = () => {
      let createdAtMoment;
      if (!isNaN(item.createdAt)) {
        createdAtMoment = moment(new Date(Number(item.createdAt)));
      } else {
        createdAtMoment = moment(item.createdAt);
      }
      const time = createdAtMoment.fromNow();
      setTimeAgo(time);
    };

    calculateTimeAgo();

    const checkUserLiked = () => {
      const currentUserLiked = likes.some(
        (like) => like.username === usernameLogin
      );
      setLikedByCurrentUser(currentUserLiked);
    };

    checkUserLiked();

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
  }, [item.createdAt, likes]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleLikesModal = () => {
    setLikesModalVisible(!isLikesModalVisible);
  };

  const handleComment = async () => {
    setLoading(true);
    try {
      const { data } = await addComment({
        variables: {
          input: {
            postId: item._id,
            content: comment,
          },
        },
      });
      setComments([...comments, data.addComment.comments.pop()]);
      setComment("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const newLikes = likedByCurrentUser
      ? likes.filter((like) => like.username !== usernameLogin)
      : [...likes, { username: usernameLogin }];

    setLikes(newLikes);
    setLikedByCurrentUser(!likedByCurrentUser);

    try {
      if (likedByCurrentUser) {
        await removeLike({
          variables: {
            postId: item._id,
          },
        });
      } else {
        await addLike({
          variables: {
            postId: item._id,
          },
        });
      }
    } catch (error) {
      setLikes(likes);
      setLikedByCurrentUser(likedByCurrentUser);
      console.log(error);
    }
  };

  return (
    <View style={styles.postContainer}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Profile", { userId: item.authorId })
        }
        style={styles.userRow}
      >
        <View style={styles.postHeader}>
          <Image
            source={{
              uri:
                item.Author.imgUrl ||
                `https://ui-avatars.com/api/?name=${item.Author.username}&background=5b5cae&color=fff&font-size=0.33`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.Author.username}</Text>
        </View>
      </TouchableOpacity>
      <Image source={{ uri: item.imgUrl }} style={styles.postImage} />
      <View style={styles.postFooter}>
        <View style={styles.iconsRow}>
          <TouchableOpacity onPress={handleLike}>
            {likedByCurrentUser ? (
              <FontAwesome
                name="heart"
                size={24}
                style={styles.icon}
                color="red"
              />
            ) : (
              <Feather
                name="heart"
                size={24}
                style={styles.icon}
                color="black"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleModal}>
            <Feather name="message-circle" size={24} style={styles.icon} />
          </TouchableOpacity>
          <Feather name="send" size={24} style={styles.icon} />
        </View>
        <TouchableOpacity onPress={toggleLikesModal}>
          <Text style={styles.likes}>{likes.length} likes</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>
          <Text style={styles.username}>{item.Author.username}</Text>{" "}
          {showMore ? item.content : `${item.content.substring(0, 100)}`}
          {item.content.length > 100 && (
            <TouchableOpacity onPress={() => setShowMore(!showMore)}>
              <Text style={styles.more}>{showMore ? "less" : "... more"}</Text>
            </TouchableOpacity>
          )}
          <Text> {item.tags} </Text>
        </Text>
        <TouchableOpacity onPress={toggleModal}>
          <Text style={styles.viewAllComments}>
            View all {comments.length} comments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModal}>
          {comments.slice(0, 1).map((comment, index) => (
            <Text key={index} style={styles.comment}>
              <Text style={styles.username}>{comment.username}</Text>{" "}
              {comment.content}
            </Text>
          ))}
        </TouchableOpacity>

        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
        hideModalContentWhileAnimating
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Profile", {
                      userId: item.authorId,
                    });
                    toggleModal();
                  }}
                  style={styles.userRow}
                >
                  <Image
                    source={{
                      uri:
                        item.imgUrl ||
                        `https://ui-avatars.com/api/?name=${item.username}&background=5b5cae&color=fff&font-size=0.33`,
                    }}
                    style={styles.commentAvatar}
                  />
                </TouchableOpacity>
                <View style={styles.commentTextContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Profile", {
                        userId: item.authorId,
                      });
                      toggleModal();
                    }}
                    style={styles.userRow}
                  >
                    <Text style={styles.commentUsername}>{item.username}</Text>
                  </TouchableOpacity>
                  <Text>{item.content}</Text>
                  <Text style={styles.commentTime}>
                    {!isNaN(item.createdAt)
                      ? moment(new Date(Number(item.createdAt))).fromNow()
                      : moment(item.createdAt).fromNow()}
                  </Text>
                </View>
              </View>
            )}
          />
          <View style={styles.commentInputContainer}>
            {/* <Feather name="camera" size={24} color="#5b5cae" style={styles.commentInputAvatar}/> */}
            {/* <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${usernameLogin}&background=5b5cae&color=fff&font-size=0.33`,
              }}
              style={styles.commentInputAvatar}
            /> */}
            <TextInput
              ref={textInputRef}
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleComment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#5b5cae" />
              ) : (
                <Feather name="send" size={24} color="#5b5cae" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={isLikesModalVisible}
        onBackdropPress={toggleLikesModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
        hideModalContentWhileAnimating
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Likes</Text>
          </View>
          <FlatList
            data={likes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Profile", {
                    userId: item.authorId,
                  });
                  toggleLikesModal();
                }}
                style={styles.userRow}
              >
                <Image
                  source={{
                    uri:
                      item.imgUrl ||
                      `https://ui-avatars.com/api/?name=${item.username}&background=5b5cae&color=fff&font-size=0.33`,
                  }}
                  style={styles.commentAvatar}
                />
                <Text style={styles.commentUsername}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postContainer: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 300,
  },
  postFooter: {
    padding: 10,
  },
  iconsRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  likes: {
    fontWeight: "bold",
  },
  caption: {
    marginTop: 5,
  },
  more: {
    color: "gray",
  },
  timeAgo: {
    color: "gray",
  },
  viewAllComments: {
    color: "gray",
    marginTop: 5,
  },
  comment: {
    marginTop: 5,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    alignSelf: "flex-start",
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: "bold",
  },
  commentTime: {
    color: "gray",
    fontSize: 12,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 10,
  },
  commentInputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: "#BBA9D4",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    padding: 8,
    marginLeft: 3,
  },
});
