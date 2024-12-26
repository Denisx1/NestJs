import { Types } from 'mongoose';
import { IUser } from './userInterface';
import { IRole } from 'src/roles/interfaces/roleInterfaces';

// local Interface
interface IObjectFilter {
  $regex: string;
  $options: string;
}
export class IQueryParams {
  search?: string; // Параметр поиска, необязательный
  limit?: number; // Лимит записей
  page?: number; // Номер страницы
  age_gte?: number;
  age_lte?: number;
  roleName?: string; // Add optional roles property
}

// query buider interface
export interface IFilterQuery {
  $or?: Array<{
    name?: IObjectFilter;
    email?: IObjectFilter;
    tags?: IObjectFilter;
  }>;
  age?: { $gte?: number; $lte?: number };
  roles?: IRole | { $in: Types.ObjectId[] | string };
}
// this interface implment to :id routes as object for filer in db
export interface IGetUserBySome {
  _id?: Types.ObjectId | string;
  email?: string;
  name?: string;
  age?: number;
  roles?: string[];
}

// get all users interface
export interface IGetAllUsers {
  users: IUser[];
  count: number;
  page: number;
  perPage: number;
}
