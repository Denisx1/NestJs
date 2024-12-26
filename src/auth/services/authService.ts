import { Injectable } from '@nestjs/common';
import { AuthDto } from '../dto/authDto';
import { ApiError } from 'src/errors/errorhandler';
import { AuthRepository } from '../repositories/auth.repository';
import { IAuth } from '../interfaces/schemaInterface';
import { PasswordService } from './passwordService';
import { TokenService } from './tokenService';
import { ITokenPair } from '../interfaces/tokenInterface';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from '../dto/createUserDto';
import { RoleName } from '../../roles/enums/rols.enum';
import { RolesService } from 'src/roles/roles.service';
import { IUser } from 'src/user/interfaces/userInterface';
import { ActionTypeEnum } from '../enums/actionType.enum';
import { Tokens } from '../enums/tokens.enum';
import { ActionTokenRepository } from '../repositories/actionTokenRepo';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RolesService,
    private readonly authRepo: AuthRepository,
    private readonly actionTokenRepo: ActionTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(authDto: AuthDto): Promise<IAuth> {
    try {
      const user = await this.userService.getUserBySome({
        email: authDto.email,
      });
      if (!user) {
        throw new ApiError(
          `User wirh this email: ${authDto.email} not found`,
          404,
        );
      }
      await this.passwordService.doesPasswordSame(
        user.password,
        authDto.password,
      );
      const tokenPair = this.tokenService.generateTokenPair({ _id: user._id });
      const userToLogin = await this.authRepo.login(user, tokenPair);
      return userToLogin;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async registration(createUserDto: CreateUserDto): Promise<IAuth> {
    try {
      const { email, password } = createUserDto;
      const existinguser = await this.userService.getUserBySome({ email });
      if (existinguser) {
        throw new ApiError(
          `Email ${createUserDto.email} is already in use`,
          409,
        );
      }

      const defaulrRole: object = { name: RoleName.USER };

      const roleDocument = await this.roleService.getRoleBySome({
        ...defaulrRole,
      });
      if (!roleDocument) {
        throw new ApiError(`Role ${defaulrRole} not found`, 404);
      }
      const hashPassword = await this.passwordService.hashPassword(password);

      const tokenPair = this.tokenService.generateTokenPair({ email });

      const user = await this.authRepo.register({
        ...createUserDto,
        password: hashPassword,
        roles: roleDocument._id,
      });

      const userToLogin = await this.authRepo.login(user, tokenPair);
      return userToLogin;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async logout(auth: Partial<IAuth>): Promise<IAuth | null> {
    try {
      const deletedUser = await this.authRepo.logout({
        _id: auth._id,
      });
      return deletedUser;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async refresh(auth: Partial<IAuth>): Promise<ITokenPair> {
    try {
      const tokenPair = this.tokenService.generateTokenPair({
        _id: auth._id,
      });
      const refreshedUser = await this.authRepo.refresh(auth, tokenPair);
      return refreshedUser;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async refreshPassword(data: Partial<IUser>): Promise<string> {
    try {
      const user = await this.userService.getUserBySome({ email: data.email });
      if (!user) {
        throw new ApiError(`User with this email ${data.email} not found`, 404);
      }
      const actionToken = this.tokenService.generateActionToken({
        _id: user._id,
      });
      const forgotPasswordUrl = `http://localhost:2000/api/auth/reset-password?token=${actionToken}`;
      await this.actionTokenRepo.createActionType({
        userId: user._id,
        token: actionToken,
        actionType: ActionTypeEnum.FORGOT_PASSWORD,
      });
      return forgotPasswordUrl;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
  async setPasswordAfterForgot(
    actionToken: string,
    newPassword: string,
  ): Promise<IUser> {
    try {
      await this.tokenService.validateToken(actionToken, Tokens.ACTION_TOKEN);
      const isPresent =
        await this.actionTokenRepo.getUserByActionToken(actionToken);
      if (!isPresent) {
        throw new ApiError(
          `user with This token ${actionToken} not found`,
          404,
        );
      }
      const newHashPassword =
        await this.passwordService.hashPassword(newPassword);
      await this.userService.updateUser(isPresent.userId._id, {
        password: newHashPassword,
      });
      await this.actionTokenRepo.deleteUserFromLogin(isPresent.userId._id);
      await this.actionTokenRepo.deleteActionToken(actionToken);
      const newUser = await this.userService.getUserBySome({
        _id: isPresent.userId._id,
      });
      return newUser;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
