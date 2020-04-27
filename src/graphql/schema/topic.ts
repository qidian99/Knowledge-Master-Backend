import { gql } from 'apollo-server-express';

const typedef = gql`
  type Topic {
    topicId: ID!
    name: String!
  }

  extend type Query {
    topics: [Topic]
  }
`;

export default typedef;
