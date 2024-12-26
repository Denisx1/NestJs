import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  IFilterQuery,
  IGetAllUsers,
  IGetUserBySome,
} from './interfaces/queryInterface';
import { IUser } from './interfaces/userInterface';
import { IUpdateUser } from './interfaces/updateUserInterface';
import { User, UserDocument } from './schema/user-model';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getAllUsers(
    filterObject: IFilterQuery,
    page: number,
    skip: number,
    limit: number,
  ): Promise<IGetAllUsers> {
    const users = await this.userModel
      .find(filterObject)
      .populate({
        path: 'roles',
        model: 'Role',
      })
      .skip(skip)
      .limit(limit);

    const count = await this.userModel.countDocuments(filterObject);

    return {
      count,
      perPage: limit,
      page,
      users,
    };
  }

  async deleteUser(_id: Types.ObjectId | string): Promise<IUser | null> {
    const deletedUser = await this.userModel
      .findOneAndDelete({ _id }, { new: true })
      .populate({ path: 'roles', model: 'Role' })
      .exec();
    return deletedUser;
  }

  async updateUser(
    _id: string | Types.ObjectId,
    filterObject: IUpdateUser,
  ): Promise<IUser> {
    const { posts, removePosts, ...updateData } = filterObject;

    if (updateData.comments) {
      return await this.userModel.findByIdAndUpdate(
        _id,
        { $push: { comments: updateData.comments._id } },
        { new: true },
      );
    }
    if (removePosts) {
      return await this.userModel.findByIdAndUpdate(
        _id,
        { $pull: { posts: { $in: removePosts } } },
        { new: true },
      );
    }
    if (posts) {
      return await this.userModel.findByIdAndUpdate(
        _id,
        { $push: filterObject },
        { new: true },
      );
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(_id, { $set: updateData }, { new: true })
      .populate({
        path: 'roles',
        model: 'Role',
      })
      .exec();
    return updatedUser;
  }

  async getUserBySome(filterObject: IGetUserBySome): Promise<IUser> {
    const user = await this.userModel
      .findOne(filterObject)
      .populate({
        path: 'roles',
        model: 'Role',
      })
      .exec();
    return user;
  }
}
