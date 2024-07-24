const { ObjectId } = require("mongodb");
const redis = require("../config/redisConfig");

const typeDefs = `#graphql

type Author {
  _id: ID
  name: String
  username: String
  imgUrl: String
  email: String
}

type Post {
  _id: ID
  content: String
  tags: [String]
  imgUrl: String
  authorId: ID
  comments: [Comment]
  likes: [Like]
  createdAt: String
  updatedAt: String
  Author: Author
}

type Comment {
  _id: ID
  content: String
  username: String
  imgUrl: String
  createdAt: String
  updatedAt: String
}
type Like {
  _id: ID
  username: String
  imgUrl: String
  createdAt: String
  updatedAt: String
}

input CreatePostInput{
  content: String!
  tags: [String]
  imgUrl: String
}

input CreateCommentInput {
  postId: ID!
  content: String!
  username: String
}

type Query {
  getAllPosts: [Post]
  getPostById(id: ID!): Post
}

type Mutation {
  createPost(input: CreatePostInput): Post
  addComment(input: CreateCommentInput): Post
  addLike(postId: ID): Post
  removeLike(postId: ID): Post
}
`;

const resolvers = {
  Query: {
    getAllPosts: async (_, __, contextValue) => {
      try {
        const { db } = contextValue;
        await contextValue.authentication();

        const cacheRedis = await redis.get("posts:all");
        if (cacheRedis) {
          return JSON.parse(cacheRedis);
        }

        const postCollection = await db.collection("posts");
        const posts = await postCollection
          .aggregate([
            {
              $lookup: {
                from: "user",
                localField: "authorId",
                foreignField: "_id",
                as: "Author",
              },
            },
            { $unwind: { path: "$Author" } },
            { $project: { "Author.password": 0 } },
            { $sort: { createdAt: -1 } },
          ])
          .toArray();

        await redis.set("posts:all", JSON.stringify(posts));
        return posts;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Could not fetch posts");
      }
    },

    getPostById: async (_, { id }, contextValue) => {
      try {
        const { db } = contextValue;
        await contextValue.authentication();

        // const cacheRedis = await redis.get(`post:${id}`);
        // if (cacheRedis) {
        //   return JSON.parse(cacheRedis);
        // }

        const postCollection = db.collection("posts");
        const post = await postCollection
          .aggregate([
            {
              $match: { _id: new ObjectId(id) },
            },
            {
              $lookup: {
                from: "user",
                localField: "authorId",
                foreignField: "_id",
                as: "Author",
              },
            },
            { $unwind: { path: "$Author" } },
            { $project: { "Author.password": 0 } },
          ])
          .toArray();

        // await redis.set(`post:${id}`, JSON.stringify(post[0]));
        return post[0];
      } catch (error) {
        console.error("Error fetching post by ID:", error);
        throw new Error("Could not fetch post");
      }
    },
  },
  Mutation: {
    createPost: async (_, { input }, contextValue) => {
      const { db } = contextValue;
      const { id } = await contextValue.authentication();

      if (!input.content) {
        throw new Error("Content is required");
      }
      if (!input.imgUrl) {
        throw new Error("Image URL is required");
      }

      const newPost = {
        content: input.content,
        tags: input.tags || [],
        imgUrl: input.imgUrl || "",
        authorId: new ObjectId(id),
        comments: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const postCollection = db.collection("posts");

        const result = await postCollection.insertOne(newPost);

        await redis.del("posts:all");

        return {
          ...newPost,
          _id: result.insertedId,
        };
      } catch (error) {
        console.error("Error creating post:", error);
        throw new Error("Could not create post");
      }
    },

    addComment: async (_, { input }, contextValue) => {
      const { db } = contextValue;
      const { username, imgUrl } = await contextValue.authentication();
      const { postId, content } = input;

      if (!content) throw new Error("Content is required");

      try {
        const postCollection = db.collection("posts");

        // Check if the post exists
        const post = await postCollection.findOne({
          _id: new ObjectId(postId),
        });
        if (!post) {
          throw new Error("Post not found");
        }

        const comment = {
          _id: new ObjectId(),
          content,
          username,
          imgUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $push: { comments: comment } }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Could not add comment");
        }
        await redis.del("posts:all");

        return await postCollection.findOne({ _id: new ObjectId(postId) });
      } catch (error) {
        console.error("Error adding comment:", error);
        throw new Error("Could not add comment");
      }
    },

    addLike: async (_, { postId }, contextValue) => {
      const { db } = contextValue;
      const { username, imgUrl } = await contextValue.authentication();

      if (!username) throw new Error("Username is required");

      const like = {
        username,
        imgUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const postCollection = db.collection("posts");
        const post = await postCollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          throw new Error("Post not found");
        }

        const alreadyLiked = post.likes.some(
          (like) => like.username === username
        );

        if (alreadyLiked) {
          throw new Error("You have already liked this post");
        }

        const like = {
          _id: new ObjectId(),
          username,
          imgUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $push: { likes: like } }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Could not add like");
        }

        await redis.del("posts:all");

        return await postCollection.findOne({ _id: new ObjectId(postId) });
      } catch (error) {
        console.error("Error adding like:", error);
        throw new Error("Could not add like");
      }
    },
    removeLike: async (_, { postId }, contextValue) => {
      const { db } = contextValue;
      const { username } = await contextValue.authentication();

      if (!username) throw new Error("Username is required");

      try {
        const postCollection = db.collection("posts");
        const post = await postCollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          throw new Error("Post not found");
        }

        const likeIndex = post.likes.findIndex(
          (like) => like.username === username
        );

        if (likeIndex === -1) {
          throw new Error("You have not liked this post");
        }

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { likes: { username } } }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Could not remove like");
        }
        await redis.del("posts:all");

        return await postCollection.findOne({ _id: new ObjectId(postId) });
      } catch (error) {
        console.error("Error removing like:", error);
        throw new Error("Could not remove like");
      }
    },
  },
};

module.exports = { typeDefs, resolvers };
