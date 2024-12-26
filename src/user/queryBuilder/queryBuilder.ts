import { IFilterQuery } from '../interfaces/queryInterface';
import { RolesService } from 'src/roles/roles.service';
import { IQueryParams } from '../interfaces/queryInterface';

export class QueryBuilder {
  private filterObject: IFilterQuery = {};
  constructor(
    private roleService: RolesService,
    private otherFilters: Partial<IQueryParams>,
  ) {}

  async build(): Promise<IFilterQuery> {
    this.addSearchFilter();
    this.addAgeFilter();
    await this.addRoleFilter();
    return this.filterObject;
  }

  private addSearchFilter() {
    const { search } = this.otherFilters;
    if (search) {
      this.filterObject = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          //   { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
  }
  private addAgeFilter() {
    const { age_gte, age_lte } = this.otherFilters;
    if (age_gte || age_lte) {
      this.filterObject.age = {
        ...this.filterObject.age,
        ...(age_gte && { $gte: age_gte }),
        ...(age_lte && { $lte: age_lte }),
      };
    }
  }
  private async addRoleFilter() {
    const { roleName } = this.otherFilters;
    if (roleName) {
      const allAboutRole = await this.roleService.getRoleBySome({
        name: roleName,
      });
      if (allAboutRole) {
        this.filterObject.roles = {
          $in: [allAboutRole._id],
        };
      }
    }
  }
}
