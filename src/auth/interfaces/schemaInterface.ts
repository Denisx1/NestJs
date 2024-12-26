import { Types } from 'mongoose';
import { IUser } from 'src/user/interfaces/userInterface';

export interface IAuth {
  _id?: Types.ObjectId;
  userId?: IUser;
  accessToken?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
