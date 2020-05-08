import { gql } from 'apollo-server-express';
import userSchema from './user';
import topicSchema from './topic';
import postSchema from './post';
import commentSchema from './comment';
import roomSchema from './room';
import messageSchema from './message';

const rootSchema = gql`
  scalar ObjectScalarType

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;
export default [
  rootSchema,
  userSchema,
  topicSchema,
  postSchema,
  commentSchema,
  roomSchema,
  messageSchema
];
