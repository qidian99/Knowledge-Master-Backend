import { gql } from 'apollo-server-express';

const typedef = gql`
  type Topic {
    topicId: ID!
    name: String!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    topics: [Topic]
  }

  extend type Mutation {
    deleteAllTopics: Int!
  }
`;

export default typedef;
