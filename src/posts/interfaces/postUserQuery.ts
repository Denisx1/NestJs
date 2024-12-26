import { Types } from 'mongoose';

export interface IPostUserQuery {
  _id?: Types.ObjectId;
  postId?: Types.ObjectId; // ID поста может быть строкой или ObjectId
  authorId?: Types.ObjectId; // ID автора может быть строкой или ObjectId
  actionType?: string;
  commentCount?: number;
}
