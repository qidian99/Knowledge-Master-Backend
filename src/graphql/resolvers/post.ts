import Post from '../../models/post';
import Comment from '../../models/comment';
import Topic from '../../models/topic';
import { ApolloError } from 'apollo-server-errors';
import { checkUserContext } from '../../util';
import mongoose from 'mongoose';
import pubsub from '../../util/pubsub';
import { PostDocument } from '../../interfaces/PostDocument';
import errMsg from '../util/errorMessage';
const POST_ADDED = 'POST_ADDED';

export default {
  Post: {
    postId: async (parent: any): Promise<any> => parent._id
  },
  Subscription: {
    postAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  },
  Query: {
    posts: async (parent: any, args: any, context: any): Promise<any> => {
      const { topicId } = args;

      if (topicId) {
        // const test = await Post.aggregate([
        //   { "$match": { "topic": new ObjectId(topicId) } },
        //   {
        //     $lookup: {
        //       from: "comments",
        //       localField: "_id",
        //       foreignField: "post",
        //       as: "comments"
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: "topics",
        //       localField: "topic",
        //       foreignField: "_id",
        //       as: "topic"
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: "users",
        //       localField: "user",
        //       foreignField: "_id",
        //       as: "user"
        //     }
        //   },
        //   {
        //     $project: {
        //       "block": 1,
        //       "title": 1,
        //       "body": 1,
        //       "likes": 1,
        //       "hide": 1,
        //       "createdAt": 1,
        //       "updatedAt": 1,
        //       "comments": 1,
        //       "topic": { "$arrayElemAt": [ "$topic", 0 ] },
        //       "user": { "$arrayElemAt": [ "$user", 0 ] }
        //     }
        //   },
        //   { $sort: { updatedAt: -1 } }
        // ])
        // console.log('test', test[0].comments)
        // return test

        console.log('Find posts by topic ID:', topicId);
        const posts = await Post.find({ topic: topicId }, null, {
          sort: { updatedAt: -1 }
        })
          .populate({
            path: 'user',
            populate: {
              path: 'subscription',
              model: 'Topic'
            }
          })
          .populate('topic')
          .populate('likes')
          .populate({
            path: 'comments',
            populate: {
              path: 'user',
              model: 'User',
              populate: {
                path: 'subscription',
                model: 'Topic'
              }
            }
          });
        console.log(posts);
        return posts;
      }
    },
    findUserPosts: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR);
      }
      const posts = await Post.find({ user }, null, {
        sort: { updatedAt: -1 }
      })
        .populate({
          path: 'user',
          populate: {
            path: 'subscription',
            model: 'Topic'
          }
        })
        .populate('topic')
        .populate('likes')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            model: 'User',
            populate: {
              path: 'subscription',
              model: 'Topic'
            }
          }
        });
      console.log(posts);
      return posts;
    },
    post: async (parent: any, args: any, context: any): Promise<any> => {
      const { postId } = args;

      if (postId) {
        console.log('Find posts by postId', postId);
        const post = await Post.findById(postId)
          .populate({
            path: 'user',
            populate: {
              path: 'subscription',
              model: 'Topic'
            }
          })
          .populate('topic')
          .populate('likes')
          .populate({
            path: 'comments',
            populate: {
              path: 'user',
              model: 'User',
              populate: {
                path: 'subscription',
                model: 'Topic'
              }
            }
          });
        console.log('Found post', post);
        return post;
      }
    }
  },
  Mutation: {
    createPost: async (
      parent: any,
      args: any,
      context: any
    ): Promise<PostDocument> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR);
      }

      const { topicId, title, body, images = [] } = args;

      // console.log(args)

      // find topic
      const topic = await Topic.findById(topicId);
      if (!topic) {
        console.log('Topic ID not found');
        throw new ApolloError('Topic ID not found', '422');
      }

      console.log(args, user._id);

      const post = await new Post({
        topic,
        user,
        title,
        body,
        block: 'default',
        hide: false,
        likes: [],
        comments: [],
        images
      }).save();

      console.log(post);
      pubsub.publish(POST_ADDED, { postAdded: post });

      return post;
    },
    editPost: async (
      parent: any,
      args: any,
      context: any
    ): Promise<PostDocument> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR);
      }

      const { postId, title, body, images } = args;

      // find topic
      const post = await Post.findById(postId)
        .populate({
          path: 'user',
          populate: {
            path: 'subscription',
            model: 'Topic'
          }
        })
        .populate('topic')
        .populate('likes')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            model: 'User',
            populate: {
              path: 'subscription',
              model: 'Topic'
            }
          }
        });

      if (!post) {
        console.log('Post not found');
        throw new ApolloError('Post not found', '422');
      }

      console.log(
        post.user._id,
        user._id,
        post.user._id.toString() !== user._id.toString()
      );
      if (post.user._id.toString() !== user._id.toString()) {
        console.log('You are not the author');
        throw new ApolloError('Post author incorrect', '422');
      }

      console.log(args, user._id);
      if (title) {
        post.title = title;
      }

      if (body) {
        post.body = body;
      }

      if (images) {
        post.images = images;
      }

      await post.save();

      console.log('Post updated', post);

      return post;
    },
    deleteAllPosts: async (
      parent: any,
      args: any,
      context: any
    ): Promise<number> => {
      const deleteRes = await Post.deleteMany({});
      return deleteRes.deletedCount as number;
    },
    deletePost: async (
      parent: any,
      args: any,
      context: any
    ): Promise<number> => {
      const user = checkUserContext(context);
      const { postId } = args;
      const post = await Post.findOneAndDelete({
        _id: postId,
        user: user._id
      });
      if (!post) {
        throw new ApolloError('Post does not exist');
      }
      console.log('Deleted post', post);
      const comments = post.comments;
      console.log(
        'Deleting comments',
        comments.map((id) => mongoose.Types.ObjectId(id))
      );
      const delRes = await Comment.deleteMany({
        _id: { $in: comments.map((id) => mongoose.Types.ObjectId(id)) }
      });
      console.log('Deleted comments count:', delRes.deletedCount);
      return delRes.deletedCount as number;
    },
    likeAPost: async (
      parent: any,
      args: any,
      context: any
    ): Promise<Array<string>> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR);
      }

      const { postId } = args;

      const post = await Post.findById(postId);

      if (!post) {
        throw new ApolloError(...errMsg.POST_FIND_ERR);
      }

      const userId = user._id;
      console.log(post.likes, userId);

      const index = post.likes.findIndex((id) => {
        return id.toString() == userId;
      });
      if (index !== -1) {
        post.likes.splice(index, 1);
      } else {
        post.likes.unshift(userId);
      }
      await post.save();

      return post.likes;
    }
  }
};
