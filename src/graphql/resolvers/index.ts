import userResolver from './user';
import topicResolver from './topic';
import postResolver from './post';
import commentResolver from './comment';
import messageResolver from './message';
import roomResolver from './room';
import ObjectScalarType from './ObjectScalarType';

export default [
  ObjectScalarType,
  userResolver,
  topicResolver,
  postResolver,
  commentResolver,
  messageResolver,
  roomResolver
];
