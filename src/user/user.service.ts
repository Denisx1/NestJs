import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { IUser } from './interfaces/userInterface';
import {
  IGetUserBySome,
  IFilterQuery,
  IGetAllUsers,
} from './interfaces/queryInterface';
import { IQueryParams } from './interfaces/queryInterface';
import { isValidObjectId, Types } from 'mongoose';
import { ApiError } from 'src/errors/errorhandler';
import { RolesService } from '../roles/roles.service';
import { IUpdateUser } from './interfaces/updateUserInterface';
import { QueryBuilder } from './queryBuilder/queryBuilder';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject(RolesService) private readonly rolesService: RolesService,
  ) {}

  async getAllUsers(query: IQueryParams): Promise<IGetAllUsers> {
    const { page = 1, limit = 10, ...otherFilters } = query;
    const skip: number = (page - 1) * limit;

    const queryBuilder = new QueryBuilder(this.rolesService, otherFilters);
    const filterObject: IFilterQuery = await queryBuilder.build();

    const data = await this.userRepo.getAllUsers(
      filterObject,
      page,
      skip,
      limit,
    );
    return data;
  }
  async getUserBySome(filterObject: IGetUserBySome): Promise<IUser> {
    const user = await this.userRepo.getUserBySome(filterObject);
    return user;
  }

  async updateUser(
    _id: string | Types.ObjectId,
    filterObject: Partial<IUpdateUser>,
  ): Promise<IUser> {
    if (filterObject.roles?.name) {
      const newRole = await this.rolesService.getRoleBySome({
        name: filterObject.roles.name,
      });
      filterObject.roles = newRole._id;
      return;
    }

    const updatedUser = await this.userRepo.updateUser(_id, filterObject);
    return updatedUser;
  }

  async deleteUser(_id: Types.ObjectId | string): Promise<IUser> {
    if (!_id || !isValidObjectId(_id)) {
      throw new ApiError('Invalid or missing ID', 400);
    }
    const deletedUser = await this.userRepo.deleteUser(_id);
    if (!deletedUser) {
      throw new ApiError('User not found or already deleted', 404);
    }
    return deletedUser;
  }
}
