import { gql } from 'apollo-server-express';

const typedef = gql`
  scalar ObjectScalarType
  type User {
    userId: ID!
    username: String!
    password: String
  }

  type LoginResponse {
    user: User!
    token: String!
  }

  input UserInput {
    email: String!
    password: String!
  }

  input SignupInput {
    username: String
    email: String!
    password: String!
  }

  type Response {
    message: String!
    data: ObjectScalarType!
  }

  extend type Query {
    users: [User]
    user(userId: ID!): User!
    currentUser: User
    testUser: Response
  }

  extend type Mutation {
    signup(input: SignupInput!): LoginResponse!
    login(input: UserInput!): LoginResponse!
    deleteAllNonAdmin: Int!
  }
`;

export default typedef;
