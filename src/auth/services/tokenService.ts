import * as jwt from 'jsonwebtoken';
import { IUser } from 'src/user/interfaces/userInterface';
import { ITokenPair } from '../interfaces/tokenInterface';
import { Injectable } from '@nestjs/common';
import { SecretTokens, Tokens } from '../enums/tokens.enum';
import { ApiError } from 'src/errors/errorhandler';
import { AuthRepository } from '../repositories/auth.repository';
import { IAuth } from '../interfaces/schemaInterface';

@Injectable()
export class TokenService {
  constructor(private readonly authRepo: AuthRepository) {}
  generateTokenPair(encodeData: Partial<IUser>): ITokenPair {
    const accessToken = jwt.sign(encodeData, SecretTokens.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(
      encodeData,
      SecretTokens.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }
  generateActionToken(encodeData: Partial<IUser>): string {
    const actionToken = jwt.sign(encodeData, SecretTokens.ACTION_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    return actionToken;
  }

  validateToken(
    token: string,
    tokenType: string = Tokens.ACCESS_TOKEN,
  ): string | jwt.JwtPayload {
    try {
      let secretWord: string = SecretTokens.ACCESS_TOKEN_SECRET;
      if (tokenType === Tokens.REFRESH_TOKEN) {
        secretWord = SecretTokens.REFRESH_TOKEN_SECRET;
      }
      if (tokenType === Tokens.ACTION_TOKEN) {
        secretWord = SecretTokens.ACTION_TOKEN_SECRET;
      }
      return jwt.verify(token, secretWord);
    } catch (error) {
      throw new ApiError(error.message || `invalid token`, 401);
    }
  }

  async getUserByToken(filterObject: ITokenPair): Promise<IAuth> {
    const autheduser = await this.authRepo.getUserByToken(filterObject);
    return autheduser;
  }
}
