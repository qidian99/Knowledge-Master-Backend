import { Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  username: string;
  name: string;
  password: string;
  roles: Array<string>;
  sessionKey: string;
  openid: string;
  avatarUrl: string;
  city: string;
  country: string;
  gender: number;
  language: string;
  nickName: string;
  province: string;
  subscription: any; // for assignment
  alert: any; // for template subscription
}

export interface ProfileInput {
  avatarUrl: string;
  city: string;
  country: string;
  gender: number;
  language: string;
  nickName: string;
  province: string;
}
