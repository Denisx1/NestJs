import { Request } from 'express';
import { Types, Document } from 'mongoose';
import { IAuth } from 'src/auth/interfaces/schemaInterface';
import { IRole } from 'src/roles/interfaces/roleInterfaces';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  password?: string;
  photos?: string[];
  posts?: string[];
  roles?: IRole;
  comments?: Types.ObjectId[];
  age?: number;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomRequest extends Request {
  user?: IUser;
  authedUser?: IAuth;
}
