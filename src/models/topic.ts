import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { TopicDocument } from '../interfaces/TopicDocument';

const topicSchema = new Schema({
  name: { type: String, required: false }
});

export type TopicInterface = TopicDocument;
export type TopicModel = Model<TopicDocument>;

export default model<TopicInterface, TopicModel>('Topic', topicSchema);
