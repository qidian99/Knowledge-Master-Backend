import mongoose, { model, Model } from 'mongoose';

const { Schema } = mongoose;
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../interfaces/UserDocument';

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  roles: [{ type: String, required: true }]
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
  return bcrypt.hashSync(password);
});

export const User: UserModel = model<UserInterface, UserModel>(
  'User',
  userSchema
);

export default model('User', userSchema);
