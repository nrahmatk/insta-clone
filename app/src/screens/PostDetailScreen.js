import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import {
  GET_POST_BY_ID,
  MUTATION_ADD_COMMENT,
  MUTATION_ADD_LIKE,
} from "../queries/posts";
import { useMutation, useQuery } from "@apollo/client";
import { authContext } from "../contexts/authContext";
import Modal from "react-native-modal"; // Import react-native-modal

export default function PostDetailScreen({ route }) {
  const { usernameLogin } = useContext(authContext);
  const {
    loading: loadingQuery,
    error,
    data,
  } = useQuery(GET_POST_BY_ID, {
    variables: {
      getPostByIdId: route.params.postId,
    },
  });

  const [showMore, setShowMore] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [addComment] = useMutation(MUTATION_ADD_COMMENT);
  const [addLike] = useMutation(MUTATION_ADD_LIKE);

  useEffect(() => {
    if (data) {
      setComments(data.getPostById.comments);
      setLikes(data.getPostById.likes);

      const calculateTimeAgo = () => {
        const time = moment(
          new Date(Number(data.getPostById.createdAt))
        ).fromNow();
        setTimeAgo(time);
      };

      const checkUserLiked = () => {
        const currentUserLiked = data.getPostById.likes.some(
          (like) => like.username === usernameLogin
        );
        setLikedByCurrentUser(currentUserLiked);
      };

      calculateTimeAgo();
      checkUserLiked();
    }
  }, [data]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleComment = async () => {
    setLoading(true);
    try {
      const { data: mutationData } = await addComment({
        variables: {
          input: {
            postId: data.getPostById._id,
            content: comment,
          },
        },
      });
      setComments([...comments, mutationData.addComment.comments.pop()]);
      setComment("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    setLoading(true);
    try {
      const { data: mutationData } = await addLike({
        variables: {
          input: {
            postId: data.getPostById._id,
          },
        },
      });
      setLikes([...likes, mutationData.addLike.likes.pop()]);
      setLikedByCurrentUser(true); // Set status like pengguna menjadi true setelah melakukan like
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingQuery) {
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

  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: data.getPostById.Author.imgUrl }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {data.getPostById.Author.username}
          </Text>
        </View>
        <Image
          source={{ uri: data.getPostById.imgUrl }}
          style={styles.postImage}
        />
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
          <Text style={styles.likes}>{likes.length} likes</Text>
          <Text style={styles.caption}>
            <Text style={styles.username}>
              {data.getPostById.Author.username}
            </Text>{" "}
          {data.getPostById.content} 
          <Text> {data.getPostById.tags} </Text>
          </Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
          <TouchableOpacity onPress={toggleModal}>
            <Text style={styles.viewAllComments}>
              View all {comments.length} comments
            </Text>
          </TouchableOpacity>
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
                  <Image
                    source={{ uri: item.imgUrl }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUsername}>
                      {item.username}
                    </Text>
                    <Text>{item.content}</Text>
                    <Text style={styles.commentTime}>
                      {moment(new Date(Number(item.createdAt))).fromNow()}
                    </Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.commentInputContainer}>
              <Image
                source={{ uri: data.getPostById.Author.imgUrl }}
                style={styles.commentInputAvatar}
              />
              <TextInput
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
                  <ActivityIndicator size="small" color="blue" />
                ) : (
                  <Feather name="send" size={24} color="blue" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
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
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
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
});
