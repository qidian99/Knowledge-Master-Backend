import { gql } from 'apollo-server-express';

const typedef = gql`
  type User {
    userId: ID!
    username: String
    password: String
    openid: String!
    sessionKey: String
    avatarUrl: String
    city: String
    country: String
    gender: Int
    language: String
    nickName: String
    province: String
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

  input ProfileInput {
    avatarUrl: String
    city: String
    country: String
    gender: Int
    language: String
    nickName: String
    province: String
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
    registerOpenid(code: String!): User!
    updateUserProfile(openid: String!, profile: ProfileInput!): User!
    signup(input: SignupInput!): LoginResponse!
    login(input: UserInput!): LoginResponse!
    deleteAllNonAdmin: Int!
  }
`;

export default typedef;
