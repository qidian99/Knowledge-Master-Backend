import { Document } from 'mongoose';

export interface PostDocument extends Document {
  // TODO: change to user document
  user: any;
  topic: any;
  title: string;
  body: string;
  likes: Number;
  hide: Boolean;
}