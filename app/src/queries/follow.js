import { gql } from "@apollo/client";

export const IS_FOLLOWING = gql`
  query IsFollowing($followingId: ID!) {
    isFollowing(followingId: $followingId)
  }
`;

export const CREATE_FOLLOW = gql`
  mutation CreateFollow($followingId: ID!) {
    createFollow(followingId: $followingId) {
      message
    }
  }
`;

export const UNFOLLOW = gql`
  mutation UnFollow($followingId: ID!) {
    unFollow(followingId: $followingId) {
      message
    }
  }
`;