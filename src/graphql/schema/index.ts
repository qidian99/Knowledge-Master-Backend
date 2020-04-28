import { gql } from 'apollo-server-express';
import userSchema from './user';
import topicSchema from './topic';
import postSchema from './post';

const rootSchema = gql`
  scalar ObjectScalarType

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;
export default [rootSchema, userSchema, topicSchema, postSchema];
