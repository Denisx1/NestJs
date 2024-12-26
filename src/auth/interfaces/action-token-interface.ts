import { Types } from 'mongoose';

export interface IActionToken {
  userId: Types.ObjectId;
  token: string;
  actionType: string;
}
