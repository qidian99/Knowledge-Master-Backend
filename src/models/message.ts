import mongoose, { model, Model } from 'mongoose';
const { Schema } = mongoose;

import { MessageDocument } from '../interfaces/MessageDocument';


const MessageSchema = new Schema({
	roomId: { type: Schema.Types.ObjectId, required: true },
	senderId: {type: Schema.Types.ObjectId, required: true},
	receiverId: {type: Schema.Types.ObjectId, required: true},
	content: { type: String, required: true },
},
{ timestamps: true }
);

export type MessageInterface = MessageDocument;
export type MessageModel = Model<MessageDocument>;

export const Message = model<MessageInterface, MessageModel>('Message', MessageSchema);
export default Message;
module.exports = mongoose.model('Message', MessageSchema);
