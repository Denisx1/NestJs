import { SetMetadata } from '@nestjs/common';
import { Tokens } from '../enums/tokens.enum';

export const TokenType = (type: string = Tokens.ACCESS_TOKEN) =>
  SetMetadata('tokenType', type);
