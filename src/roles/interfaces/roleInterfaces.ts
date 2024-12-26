import { Types } from 'mongoose';

// Интерфейс для роли
export interface IRole {
  _id?: Types.ObjectId;
  name?: string;
  permissions?: string[];
  __v?: number;
}

// Основной интерфейс
