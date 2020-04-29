import Post from '../../models/post';
import Comment from '../../models/post';
import Topic from '../../models/topic';
import { ApolloError } from 'apollo-server-errors';
import { ObjectId } from 'mongodb';

export default {
  Post: {
    postId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    posts: async (parent: any, args: any, context: any): Promise<any> => {

      const {
        topicId
      } = args;

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
        //   { $sort: { createdAt: -1 } }
        // ])
        // console.log('test', test[0].comments)
        // return test

        console.log("Find posts by topic ID:", topicId)
        const posts = await Post.find({ topic: topicId }, null, { sort: { createdAt: -1 } })
          .populate('user')
          .populate('topic')
          .populate('likes')
          // .populate('comments')
          .populate({
            path: 'comments', populate: {
              path: 'user',
              model: 'User'
            }
          });
        console.log(posts);
        return posts;
      }
      // Must select a topic
      // return Post.find({}, null, { sort: { createdAt: -1 } }).populate('user').populate('topic').populate('likes').populate('comments');
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

      // console.log(args)

      // find topic
      const topic = await Topic.findById(topicId);
      if (!topic) {
        console.log("Topic ID not found")
        throw new ApolloError("Topic ID not found", '422');
      }

      console.log(args, user._id)

      const post = await new Post({
        topic,
        user,
        title,
        body,
        block: 'default',
        hide: false,
        likes: [],
        comments: []
      }).save();

      console.log(post)

      return post;
    },
    deleteAllPosts: async () => {
      const deleteRes = await Post.deleteMany({});
      return deleteRes.deletedCount;
    },
    likeAPost: async (parent: any, args: any, context: any): Promise<any> => {
      const {
        user
      } = context
      if (!user) {
        console.log("You are not authorized to create a post")
        throw new ApolloError("You are not authorized to create a post", '401');
      }

      const {
        postId
      } = args;

      const post = await Post.findById(postId);

      if (!post) {
        console.log("Post does not exist")
        throw new ApolloError("Post does not exist", '422');
      }

      const userId = user._id;
      console.log(post.likes, userId);

      const index = post.likes.findIndex((id) => {
        return id.toString() == userId
      });
      if (index !== -1) {
        post.likes.splice(index);
      } else {
        post.likes.unshift(userId);
      }
      await post.save();
      console.log(post.likes);

      return post.likes;
    }
  }
};
