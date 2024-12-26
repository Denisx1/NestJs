import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
  @IsString()
  password: string;
}
