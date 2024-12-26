import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { RoleDto } from 'src/roles/dto/updateRoleDto';

export class UpdateUserDto {
  _id?: Types.ObjectId | string;
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(0, { message: 'Age must be at least 0' }) // Минимальное значение
  @Max(120, { message: 'Age must not exceed 120' }) // Максимальное значение
  age?: number;

  @IsOptional()
  @ValidateNested() // Указывает, что нужно валидировать вложенный объект
  @Type(() => RoleDto) // Преобразует данные в класс RoleDto
  roles?: RoleDto;
}
