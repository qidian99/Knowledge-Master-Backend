import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../interfaces/UserDocument';

const userSchema = new Schema({
  email: { type: String, required: false },
  password: { type: String, required: false },
  username: { type: String, required: false },
  roles: [{ type: String, required: false }],
  sessionKey: { type: String, required: false },
  openid: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  city: { type: String, required: false },
  country: { type: String, required: false },
  gender: { type: Number, required: false },
  language: { type: String, required: false },
  nickName: { type: String, required: false },
  province: { type: String, required: false },
  subscription: { type: Schema.Types.ObjectId, ref: 'Topic', required: false }
});

export interface UserInterface extends UserDocument {
  comparePassword(password: string): boolean;
}

export interface UserModel extends Model<UserInterface> {
  hashPassword(password: string): string;
}
userSchema.method('comparePassword', function (
  this: UserDocument,
  password: string
): boolean {
  if (bcrypt.compareSync(password, this.password)) return true;
  return false;
});

userSchema.static('hashPassword', (password: string): string => {
  const hashedPassword = bcrypt.hashSync(password);
  // console.log(hashedPassword);
  return hashedPassword;
});

export const User: UserModel = model<UserInterface, UserModel>(
  'User',
  userSchema
);

export default model('User', userSchema);
