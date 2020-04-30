import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { TopicDocument } from '../interfaces/TopicDocument';

const topicSchema = new Schema(
  {
    name: { type: String, required: false }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
);

export type TopicInterface = TopicDocument;
export type TopicModel = Model<TopicDocument>;
export const Topic = model<TopicInterface, TopicModel>('Topic', topicSchema);
export default Topic;
