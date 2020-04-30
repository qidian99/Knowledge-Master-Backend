import { gql } from 'apollo-server-express';

const typedef = gql`
  type Post {
    postId: ID!
    user: User!
    topic: Topic!
    block: String!
    title: String!
    body: String!
    likes: [User]!
    hide: Boolean!
    comments: [Comment]!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    posts(topicId: ID): [Post]
    post(postId: ID!): Post
    findUserPosts: [Post]
  }

  extend type Mutation {
    createPost(topicId: ID!, title: String!, body: String!): Post!
    deleteAllPosts: Int!
    deletePost(postId: ID!): Int!
    likeAPost(postId: ID!): [User]!
  }
`;

export default typedef;
