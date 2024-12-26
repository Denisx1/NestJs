import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ICustomRequest, IUser } from './interfaces/userInterface';

import { IGetAllUsers } from './interfaces/queryInterface';
import { RoleGuard } from '../roles/guards/role.guard';
import { RoleName } from '../roles/enums/rols.enum';
import { Roles } from '../roles/decorators/role.decorator';
import { jwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateUserDto } from './dto/updateuserDto';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(RoleName.ADMIN)
  async getAllUsers(@Req() req: ICustomRequest): Promise<IGetAllUsers> {
    const allUsers = await this.userService.getAllUsers(req.query);
    return allUsers;
  }

  @Get('/user/:_id')
  @UseGuards(jwtAuthGuard)
  getUserById(@Req() req: ICustomRequest): Promise<IUser> | IUser {
    const user = this.userService.getUserBySome(req.authedUser.userId._id);
    return user;
  }

  @Patch('/user/:_id')
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(RoleName.ADMIN)
  updateUser(
    @Param('_id') _id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IUser> {
    const updatedUser = this.userService.updateUser(_id, updateUserDto);
    return updatedUser;
  }

  @Delete('/user/:_id')
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(RoleName.ADMIN)
  deleteUser(@Param('_id') _id: string): Promise<IUser> {
    const deletedUser = this.userService.deleteUser(_id);
    return deletedUser;
  }
}
