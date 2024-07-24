const { ObjectId } = require("mongodb");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

const typeDefs = `#graphql

type Users {
  _id: ID
  username: String
  bio: String
  imgUrl: String
}

type Post {
  _id: ID
  imgUrl: String
  createdAt: String
}

type UserById {
  _id: ID
  name: String
  username: String!
  email: String!
  bio: String
  imgUrl: String
  posts: [Post]
  followers: [Users]
  following: [Users]
}

type User {
  _id: ID
  name: String
  username: String!
  email: String!
}

input CreateUserInput{
  name: String
  username: String!
  email: String!
  password: String!
}

input LoginInput {
  identifier: String!
  password: String!
}

input EditUserInput {
  name: String
  username: String
  email: String
  bio: String
  imgUrl: String
}

type Login {
  access_token: String
  username: String
}

type Message {
  message: String
}

type Query {
  getAllUser: [User]
  getUserById(id: ID): UserById
  getUserByNameOrUsername(identifier: String!): [Users]
}

type Mutation {
  createAccount(input: CreateUserInput): Message
  login(input: LoginInput): Login
  editUser(input: EditUserInput): Message
}
`;

const resolvers = {
  Query: {
    getAllUser: async (_, __, contextValue) => {
      await contextValue.authentication()

      try {
        const { db } = contextValue;

        const userCollection = db.collection("user");
        const users = await userCollection.find().toArray();

        return users;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    getUserById: async (_, { id }, contextValue) => {
      try {
        const { db } = contextValue;
        const { id: authId } = await contextValue.authentication();
        const userCollection = db.collection("user");
        const followCollection = db.collection("follow");
        const postCollection = db.collection("posts");

        if (!authId) {
          if (!id) {
            throw new Error("Id user required");
          }
        }

        const user = await userCollection.findOne({
          _id: new ObjectId(id || authId),
        });

        if (!user) {
          throw new Error("User not found");
        }

        const followersCursor = followCollection.aggregate([
          {
            $match: { followingId: new ObjectId(id || authId) },
          },
          {
            $lookup: {
              from: "user",
              localField: "followerId",
              foreignField: "_id",
              as: "follower",
            },
          },
          {
            $unwind: "$follower",
          },
          {
            $project: {
              _id: "$follower._id",
              username: "$follower.username",
              bio: "$follower.bio",
              imgUrl: "$follower.imgUrl",
            },
          },
        ]);

        const followers = await followersCursor.toArray();

        const followingCursor = followCollection.aggregate([
          {
            $match: { followerId: new ObjectId(id || authId) },
          },
          {
            $lookup: {
              from: "user",
              localField: "followingId",
              foreignField: "_id",
              as: "following",
            },
          },
          {
            $unwind: "$following",
          },
          {
            $project: {
              _id: "$following._id",
              username: "$following.username",
              bio: "$following.bio",
              imgUrl: "$following.imgUrl",
            },
          },
        ]);

        const following = await followingCursor.toArray();

        const posts = await postCollection
          .find({ authorId: new ObjectId(id || authId) })
          .sort({ createdAt: -1 })
          // .project({ _id: 1, imgUrl: 1, createdAt: 1 })
          .toArray();

        return {
          ...user,
          posts,
          followers,
          following,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    getUserByNameOrUsername: async (_, { identifier }, contextValue) => {
      try {
        await contextValue.authentication();
        const { db } = contextValue;
        const userCollection = db.collection("user");

        const users = await userCollection
          .find({
            $or: [
              { name: { $regex: identifier, $options: "i" } },
              { username: { $regex: identifier, $options: "i" } },
            ],
          })
          .toArray();

        if (users.length == 0) {
          throw new Error("No user found");
        }

        return users;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    createAccount: async (_, { input }, contextValue) => {
      try {
        const { db } = contextValue;
        const userCollection = db.collection("user");

        if (!input.username) {
          throw new Error("Username is required");
        }
        if (!input.email) {
          throw new Error("Email is required");
        }
        if (!input.password) {
          throw new Error("Password is required");
        }
        if (input.password.length < 5) {
          throw new Error("Password length must be at least 5 characters");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
          throw new Error("Invalid email format");
        }

        const existingUser = await userCollection.findOne({
          $or: [{ username: input.username }, { email: input.email }],
        });

        if (existingUser) {
          if (existingUser.username === input.username) {
            throw new Error("Username is already exists");
          }
          if (existingUser.email === input.email) {
            throw new Error("Email is already exists");
          }
        }

        input.password = hashPassword(input.password);
        const newuser = await userCollection.insertOne(input);

        return {
          message: "Success create account",
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    login: async (_, { input }, contextValue) => {
      try {
        const { db } = contextValue;
        const userCollection = db.collection("user");
        const user = await userCollection.findOne({
          $or: [{ username: input.identifier }, { email: input.identifier }],
        });
        if (!user || !comparePassword(input.password, user.password)) {
          throw new Error("Invalid email or password");
        }

        const access_token = signToken({
          id: user._id,
          username: user.username,
        });
        return { access_token, username: user.username, imgUrl: user.imgUrl };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    editUser: async (_, { input }, contextValue) => {
      try {
        const { db } = contextValue;
        const { id } = await contextValue.authentication();

        const userCollection = db.collection("user");
        const updateData = { ...input };

        const updatedUser = await userCollection.findOneAndUpdate(
          { _id: id },
          { $set: updateData },
          { returnDocument: "after" }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        return { message: "Update profile success" };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = { typeDefs, resolvers };
