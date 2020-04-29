import { gql } from 'apollo-server-express';
import userSchema from './user';
import topicSchema from './topic';
import postSchema from './post';
import commentSchema from './comment';

const rootSchema = gql`
  scalar ObjectScalarType

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;
export default [rootSchema, userSchema, topicSchema, postSchema, commentSchema];
