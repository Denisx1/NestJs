import { Document, Types } from 'mongoose';

export interface ILikes extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}
