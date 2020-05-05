import { Document } from 'mongoose';

export interface RoomDocument extends Document {
  chatterId: Array<string>;
  _doc: any;
}
