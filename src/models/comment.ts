import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { CommentDocument } from '../interfaces/CommentDocument';

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  block: { type: String, required: true },
  repltyTo: { type: Schema.Types.ObjectId, ref: 'Comment', required: false },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: false },
  body: { type: String, required: true },
  // likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  hide: { type: Boolean, required: true },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

export type CommentInterface = CommentDocument;
export type CommentModel = Model<CommentDocument>;

export const Comment = model<CommentInterface, CommentModel>('Comment', commentSchema);
export default Comment
