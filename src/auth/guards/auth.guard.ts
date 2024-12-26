import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { TokenService } from '../services/tokenService';
import { ApiError } from 'src/errors/errorhandler';
import { Tokens } from '../enums/tokens.enum';
import { Reflector } from '@nestjs/core';

export class jwtAuthGuard implements CanActivate {
  TokensType: string;
  constructor(
    @Inject(TokenService) private tokenService: TokenService,
    @Inject(Reflector) private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const tokenType =
        this.reflector.get<string>('tokenType', context.getHandler()) ??
        Tokens.ACCESS_TOKEN;
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new ApiError('Authorization header is required', 401);
      }
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new ApiError('Authorization header is required', 401);
      }
      const isValid = this.tokenService.validateToken(token, tokenType);
      if (isValid) {
        const decodeData = await this.tokenService.getUserByToken({
          [tokenType]: token,
        });
        if (!decodeData) {
          throw new ApiError('User has already logouded', 404);
        }
        request.authedUser = decodeData;
        return true;
      }
      return false;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
