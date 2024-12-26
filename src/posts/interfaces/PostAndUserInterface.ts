import { Types } from 'mongoose';
export interface IPostAndUser {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
}
