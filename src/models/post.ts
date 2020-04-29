import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { PostDocument } from '../interfaces/PostDocument';

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  block: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  hide: { type: Boolean, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: false }],
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

export type PostInterface = PostDocument;
export type PostModel = Model<PostDocument>;

export const Post = model<PostInterface, PostModel>('Post', postSchema);
export default Post
