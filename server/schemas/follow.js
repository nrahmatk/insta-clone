const { ObjectId } = require("mongodb");

const typeDefs = `#graphql
type Follow {
  _id: ID
  followingId: ID
  followerId: ID
  createdAt: String
  updatedAt: String
}

type Message {
  message: String
}

type Query {
  getAllFollows: [Follow]
  isFollowing(followingId: ID!): Boolean
}

type Mutation {
  createFollow(followingId: ID!): Message
  unFollow(followingId: ID!): Message
}
`;

const resolvers = {
  Query: {
    getAllFollows: async (_, __, contextValue) => {
      await contextValue.authentication()
      const { db } = contextValue;
      const followCollection = await db.collection("follow");

      const follows = await followCollection.find().toArray();
      return follows;
    },
    isFollowing: async (_, { followingId }, contextValue) => {
      const { db } = contextValue;
      const { id } = await contextValue.authentication();
      const followCollection = db.collection("follow");

      const follow = await followCollection.findOne({
        followingId: new ObjectId(followingId),
        followerId: id,
      });

      return !!follow;
    },
  },
  Mutation: {
    createFollow: async (_, { followingId }, contextValue) => {
      const { db } = contextValue;
      const { id } = await contextValue.authentication();
      const followCollection = db.collection("follow");

      // if((new ObjectId(followingId)).toString === id.toString){
      //   throw new Error ("Cant follow yourself");
      // }

      const existingFollow = await followCollection.findOne({
        followingId: new ObjectId(followingId),
        followerId: id,
      });

      if (existingFollow) {
        throw new Error ("You are already following this user.");
      }

      const newFollow = {
        followingId: new ObjectId(followingId),
        followerId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await followCollection.insertOne(newFollow);
      return { message: "Follow created successfully" };
    },
    unFollow: async (_, { followingId }, contextValue) => {
      const { db } = contextValue;
      const { id } = await contextValue.authentication();
      const followCollection = db.collection("follow");

      const result = await followCollection.deleteOne({
        followingId: new ObjectId(followingId),
        followerId: id,
      });

      if (result.deletedCount === 0) throw new Error("Follow not found");
      return {
        message: "Unfollow successfully",
      };
    },
  },
};

module.exports = { typeDefs, resolvers };
