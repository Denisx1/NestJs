import { Types } from 'mongoose';

interface IObjectFilter {
  $regex: string;
  $options: string;
}

export interface IFilterToGetPosts {
  authorId?: Types.ObjectId;
  query?: {
    search?: string;
    limit?: number;
    page?: number;
  };
  filterObject?: {
    $or?: Array<{
      title?: IObjectFilter;
      content?: IObjectFilter;
    }>;
  };
}
