import { Types } from 'mongoose';

import { IRole } from 'src/roles/interfaces/roleInterfaces';

export interface IUpdateUser {
  _id?: Types.ObjectId | string; // Уникальный идентификатор
  name?: string; // Имя пользователя
  email?: string; // Email пользователя
  password?: string; // Пароль
  age?: number; // Возраст
  roles?: IRole; // Роли пользователя
  posts?: Types.ObjectId;
  comments?: Types.ObjectId;
  removePosts?: Types.ObjectId[];
  photos?: string[]; // Список URL фотографий
  newHashPassword?: string;
}
