import {
  IsEmail,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import * as customValidators from './customValidator';
import { IRole } from 'src/roles/interfaces/roleInterfaces';
import { Transform } from 'class-transformer';


export class CreateUserDto {
  @IsString()
  name?: string;

  @IsEmail()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @IsString()
  @customValidators.isStrongPassword()
  @MinLength(8)
  @MaxLength(15)
  password?: string;

  @IsNumber()
  age?: number;

  @IsArray()
  @IsOptional()
  roles?: IRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  posts?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
