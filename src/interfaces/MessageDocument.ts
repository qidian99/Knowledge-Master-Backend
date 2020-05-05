import { Document } from 'mongoose';
import { Types } from 'mongoose';


export interface MessageDocument extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  createdAt: string;
  updatedAt: string;
}
