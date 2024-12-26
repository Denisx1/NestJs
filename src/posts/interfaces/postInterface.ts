import { Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  title?: string;
  content?: string;
  authorId?: Types.ObjectId;
  viewsCount?: number | string;
  likesCount?: number;
  comments?: Types.ObjectId[];
  photos?: string[];
  __v?: number;
}

export interface IUdatePost {
  _id: Types.ObjectId;
  title?: string;
  content?: string;
  authorId?: Types.ObjectId;
  viewsCount?: number | string;
  likesCount?: number;
  comments?: Types.ObjectId;
  photos?: string[];
  __v?: number;
}
