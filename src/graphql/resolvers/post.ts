import Post from '../../models/post';
import Topic from '../../models/topic';
import { ApolloError } from 'apollo-server-errors';

export default {
  Post: {
    postId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    posts: async (parent: any, args: any, context: any): Promise<any> => {
      return Post.find({}).populate('user').populate('topic');
    }
  },
  Mutation: {
    createPost: async (parent: any, args: any, context: any): Promise<any> => {
      const {
        user
      } = context
      if (!user) {
        console.log("You are not authorized to create a post")
        throw new ApolloError("You are not authorized to create a post", '401');
      }

      const {
        topicId,
        title,
        body,
      } = args;

      // find topic
      const topic = await Topic.findById(topicId);
      if (!topic) {
        console.log("Topic ID not found")
        throw new ApolloError("Topic ID not found", '422');
      }

      console.log(args, user.id)

      const post = await new Post({
        topic,
        user: user.id,
        title,
        body,
        hide: false,
        likes: 0
      }).save();

      console.log(post)


      return post;
    },
    deleteAllPosts: async () => {
      const deleteRes = await Post.deleteMany({});
      return deleteRes.deletedCount;
    }
  }
};
