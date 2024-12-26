import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  postId?: Types.ObjectId;
  authorId?: Types.ObjectId;
  comment?: string;
}

export interface IPostFromRedis {
  _id: Types.ObjectId;
  title?: string;
  content?: string;
  authorId?: Types.ObjectId | string;
  viewsCount?: number | string;
  likesCount?: number;
  comments?: IComment[];
  photos?: string[];
  usersWhoLikedPost?: string[];
  usersWhoCommentedPost?: string[];
  __v?: number;
}
