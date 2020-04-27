import { gql } from 'apollo-server-express';
import userSchema from './user';
import topicSchema from './topic';

const rootSchema = gql`
  scalar ObjectScalarType

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;
export default [rootSchema, userSchema, topicSchema];
