import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput) {
    login(input: $input) {
      access_token
      username
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput) {
    createAccount(input: $input) {
      message
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($getUserByIdId: ID) {
    getUserById(id: $getUserByIdId) {
      _id
      name
      username
      email
      bio
      imgUrl
      posts {
        imgUrl
        _id
        createdAt
      }
      followers {
        _id
        username
        bio
        imgUrl
      }
      following {
        _id
        username
        bio
        imgUrl
      }
    }
  }
`;

export const GET_USER_BY_NAME_OR_USERNAME = gql`
  query Query($identifier: String!) {
    getUserByNameOrUsername(identifier: $identifier) {
      _id
      username
      bio
      imgUrl
    }
  }
`;

export const EDIT_USER = gql`
  mutation Mutation($input: EditUserInput) {
    editUser(input: $input) {
      message
    }
  }
`;
