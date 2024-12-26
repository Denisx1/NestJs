import { IPost } from './postInterface';

export interface IGetAllPosts {
  posts: IPost[];
  count: number;
  page?: number;
  perPage?: number;
}
