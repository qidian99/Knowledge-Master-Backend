import Post from '../../models/post';
import Comment from '../../models/comment';
import { ApolloError } from 'apollo-server-errors';
import { checkUserContext } from '../../util';

export default {
  Comment: {
    commentId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    comments: async (parent: any, args: any, context: any): Promise<any> => {
      const { postId } = args;
      // console.log(args);

      if (!postId) {
        console.log('Post ID is not provided');
        throw new ApolloError('Post ID is not provided');
      }

      // get the post
      const post = await Post.findById(postId);
      if (!post) {
        console.log('Post cannot be found');
        throw new ApolloError('Post cannot be found');
      }

      // fetch all comments
      const comments = await Comment.find({ post: postId }, null, {
        sort: { createdAt: -1 }
      })
        .populate('user')
        .populate('topic')
        .populate('post');
      // console.log(comments);
      return comments;
    },
    comment: async (parent: any, args: any, context: any): Promise<any> => {
      const { commentId } = args;
      // console.log(args);

      if (!commentId) {
        console.log('commentId is not provided');
        throw new ApolloError('commentId is not provided');
      }

      // get the post
      const comment = await Comment.findById(commentId);
      if (!comment) {
        console.log('comment cannot be found');
        throw new ApolloError('comment cannot be found');
      }

      return comment;
    }
  },
  Mutation: {
    createComment: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      const user = checkUserContext(context);
      const { postId, body } = args;

      // find post
      const post = await Post.findById(postId)
        .populate('topic')
        .populate('user');
      if (!post) {
        console.log('Post not found');
        throw new ApolloError('Post not found', '422');
      }

      console.log('Creating a comment for post', post);
      const comment = await new Comment({
        post,
        user,
        topic: post.topic,
        hide: false,
        block: 'default',
        body
      }).save();

      post.comments.unshift(comment._id);
      await post.save();
      console.log('Created', comment);

      return comment;
    },
    deleteAllComments: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      // const user = checkUserContext(context);
      const { postId } = args;
      if (!postId) {
        const delRes = await Comment.deleteMany({});
        return delRes.deletedCount;
        return;
      }
      const delRes = await Comment.deleteMany({
        post: postId
      });
      return delRes.deletedCount;
    },
    deleteComment: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      const user = checkUserContext(context);
      const { commentId } = args;
      const delRes = await Comment.deleteOne({
        _id: commentId,
        user: user._id
      });
      console.log(delRes);
      return delRes.deletedCount;
    }
  }
};
