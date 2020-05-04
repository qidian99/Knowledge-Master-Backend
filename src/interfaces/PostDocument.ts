import { Document } from 'mongoose';

export interface PostDocument extends Document {
  // TODO: change to user document
  user: any;
  topic: any;
  block: string;
  title: string;
  body: string;
  likes: Array<string>;
  hide: Boolean;
  comments: Array<string>;
  images: Array<string>;
}