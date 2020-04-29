import { gql } from 'apollo-server-express';

const typedef = gql`
  type Comment {
    commentId: ID!
    user: User!
    topic: Topic!
    block: String!
    replyTo: Comment
    post: Post!
    body: String!
    hide: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    comments(postId: ID!): [Comment]
  }

  extend type Mutation {
    createComment(postId: ID!, body: String!): Comment!
    deleteAllComments(postId: ID): Int!
  }
`;

export default typedef;
