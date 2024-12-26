import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import * as customValidators from './customValidator';

export class RefreshPasswordDto {
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsString()
  @customValidators.isStrongPassword()
  @MinLength(8)
  @MaxLength(15)
  @IsOptional()
  newPassword?: string;
  @IsOptional()
  actionToken?: string;
}
