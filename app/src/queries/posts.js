import { gql } from "@apollo/client";

export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    getAllPosts {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        _id
        content
        username
        imgUrl
        createdAt
        updatedAt
      }
      likes {
        _id
        username
        imgUrl
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      Author {
        _id
        name
        imgUrl
        username
        email
      }
    }
  }
`;

export const GET_POST_BY_ID = gql`
query GetPostById($getPostByIdId: ID!) {
  getPostById(id: $getPostByIdId) {
    _id
    content
    tags
    imgUrl
    authorId
    comments {
      _id
      content
      username
      imgUrl
      createdAt
      updatedAt
    }
    likes {
      _id
      username
      imgUrl
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
    Author {
      _id
      name
      username
      imgUrl
      email
    }
  }
}
`

export const MUTATION_ADD_COMMENT = gql`
 mutation AddComment($input: CreateCommentInput) {
  addComment(input: $input) {
    _id
    comments {
      _id
      content
      username
      imgUrl
      createdAt
      updatedAt
    }
    likes {
      _id
      username
      imgUrl
      createdAt
      updatedAt
    }
  }
}
`;

export const MUTATION_ADD_LIKE = gql`
  mutation AddLike($postId: ID) {
  addLike(postId: $postId) {
    _id
    comments {
      _id
      content
      username
      imgUrl
      createdAt
      updatedAt
    }
    likes {
      _id
      username
      imgUrl
      createdAt
      updatedAt
    }
  }
}
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput) {
    createPost(input: $input) {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        _id
        content
        username
        imgUrl
        createdAt
        updatedAt
      }
      likes {
        _id
        username
        imgUrl
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      Author {
        _id
        name
        username
        imgUrl
        email
      }
    }
  }
`;

export const MUTATION_REMOVE_LIKE = gql`
mutation RemoveLike($postId: ID) {
  removeLike(postId: $postId) {
    _id
    comments {
      _id
      content
      username
      imgUrl
      createdAt
      updatedAt
    }
    likes {
      _id
      username
      imgUrl
      createdAt
      updatedAt
    }
  }
}
`;
