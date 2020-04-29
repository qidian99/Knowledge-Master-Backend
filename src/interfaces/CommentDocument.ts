import { Document } from 'mongoose';

export interface CommentDocument extends Document {
  // TODO: change to user document
  user: any;
  topic: any;
  block: string;
  post: string;
  replyTo: string;
  body: string;
  // likes: Array<string>;
  hide: Boolean;
}