import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './services/authService';
import { AuthDto } from './dto/authDto';
import { IAuth } from './interfaces/schemaInterface';
import { ICustomRequest, IUser } from 'src/user/interfaces/userInterface';
import { ITokenPair } from './interfaces/tokenInterface';
import { jwtAuthGuard } from './guards/auth.guard';
import { TokenType } from './decorators/token.auth.decorator';
import { Tokens } from './enums/tokens.enum';
import { CreateUserDto } from './dto/createUserDto';
import { RefreshPasswordDto } from './dto/refreshPasswordDto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() authDto: AuthDto): Promise<IAuth> {
    return this.authService.login(authDto);
  }

  @Post('/register')
  @UsePipes(new ValidationPipe())
  async register(@Body() createUserDto: CreateUserDto): Promise<IAuth> {
    return this.authService.registration(createUserDto);
  }
  @Post('/logout')
  @UseGuards(jwtAuthGuard)
  async logout(@Req() req: ICustomRequest): Promise<IAuth | null> {
    const deletedUser = await this.authService.logout(req.authedUser);
    return deletedUser;
  }
  @Post('/refresh')
  @UseGuards(jwtAuthGuard)
  @TokenType(Tokens.REFRESH_TOKEN)
  async refresh(@Req() req: ICustomRequest): Promise<ITokenPair> {
    const refreshedUser = await this.authService.refresh(req.authedUser);
    return refreshedUser;
  }
  @Post('/refresh_password')
  @UsePipes(new ValidationPipe())
  async refreshPassword(
    @Body() refreshPasswordDto: RefreshPasswordDto,
  ): Promise<string> {
    const refreshPassword =
      await this.authService.refreshPassword(refreshPasswordDto);
    return refreshPassword;
  }
  @Patch('/set_password')
  async setPasswordAfterForgot(
    @Body() data: RefreshPasswordDto,
  ): Promise<IUser> {
    const { actionToken, newPassword } = data;
    const setPassword = await this.authService.setPasswordAfterForgot(
      actionToken,
      newPassword,
    );
    return setPassword;
  }
}
