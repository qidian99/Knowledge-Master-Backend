import { Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  username: string;
  name: string;
  password: string;
  roles: Array<string>;
}
