import { IQueryParams } from 'src/user/interfaces/queryInterface';
import { IFilterToGetPosts } from './interfaces/queryIntedface';

export class QueryBuilder {
  private filterObject: IFilterToGetPosts = {};
  constructor(private otherFilters: Partial<IQueryParams>) {}

  build(): IFilterToGetPosts {
    this.addSearchFilter();
    return this.filterObject;
  }
  private addSearchFilter() {
    const { search } = this.otherFilters;

    if (search) {
      this.filterObject.filterObject = {
        ...this.filterObject.filterObject,
        $or: [{ title: { $regex: search, $options: 'i' } }],
      };
    }
  }
}
