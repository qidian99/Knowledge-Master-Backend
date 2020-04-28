import { gql } from 'apollo-server-express';

const typedef = gql`
  type Post {
    postId: ID!
    user: User!
    topic: Topic!
    block: String!
    title: String!
    body: String!
    likes: Int!
    hide: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    posts(topicId: ID): [Post]
  }

  extend type Mutation {
    createPost(topicId: ID!, title: String!, body: String!): Post!
    deleteAllPosts: Int!
  }
`;

export default typedef;
