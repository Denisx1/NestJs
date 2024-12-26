import { Injectable } from '@nestjs/common';
import { Auth } from '../schema/auth-model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDocument } from '../schema/auth-model';
import { ITokenPair } from '../interfaces/tokenInterface';
import { IAuth } from '../interfaces/schemaInterface';
import { CreateUserDto } from '../dto/createUserDto';
import { IUser } from 'src/user/interfaces/userInterface';
import { User, UserDocument } from 'src/user/schema/user-model';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async login(user: IAuth, tokenPair: ITokenPair): Promise<IAuth> {
    const autheUser = await this.authModel.create({
      userId: user._id,
      ...tokenPair,
    });
    return autheUser;
  }
  async register(user: CreateUserDto): Promise<IUser> {
    const newUser = await this.userModel.create(user);
    return newUser;
  }
  async logout(user: Partial<IAuth>): Promise<IAuth | null> {
    const deletedUser = await this.authModel.findOneAndDelete(user._id);
    return deletedUser;
  }

  async refresh(auth: IAuth, tokenPair: ITokenPair): Promise<ITokenPair> {
    await this.authModel.deleteOne({ _id: auth._id });
    const refresheduser = await this.authModel.create({
      userId: auth.userId._id,
      ...tokenPair,
    });

    return {
      accessToken: refresheduser.accessToken,
      refreshToken: refresheduser.refreshToken,
    };
  }

  async getUserByToken(filterObject: ITokenPair): Promise<IAuth | null> {
    const user = await this.authModel.findOne(filterObject).populate({
      path: 'userId',
      populate: {
        path: 'roles',
        model: 'Role',
      },
    });

    return user;
  }
}
