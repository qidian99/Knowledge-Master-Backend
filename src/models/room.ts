import mongoose, { model, Model } from 'mongoose';
const { Schema } = mongoose;

import { RoomDocument } from '../interfaces/RoomDocument';


const RoomSchema = new Schema({
  chatterIds: { type: Array, required: true }
});

export type RoomInterface = RoomDocument;
export type RoomModel = Model<RoomDocument>;

export const Room = model<RoomInterface, RoomModel>('Room', RoomSchema);
export default Room;
module.exports = mongoose.model('Room', RoomSchema);
