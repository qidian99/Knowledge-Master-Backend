import { gql } from 'apollo-server-express';
import { User } from '../../models/user';

const UserParts = `
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
subscription: ID
`

const typedef = gql`
  type User {
    ${UserParts}
  }

  type RegisterResponse {
    ${UserParts}
    token: String
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
    registerOpenid(code: String!): LoginResponse!
    signup(input: SignupInput!): LoginResponse!
    updateUserProfile(nickName: String!, province: String!, language: String!, gender: Int!, country: String!, city: String!, avatarUrl: String!): User!
    login(input: UserInput!): LoginResponse!
    deleteAllNonAdmin: Int!
  }
`;

export default typedef;

//     updateUserProfile(openid: String!, profile: ProfileInput!): User!
