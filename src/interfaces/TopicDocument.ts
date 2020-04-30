import { Document } from 'mongoose';

export interface TopicDocument extends Document {
  name: string;
  createdAt: string;
  udpatedAt: string;
}
