import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { RoleName } from '../enums/rols.enum';
import { Permission } from '../enums/permissions.enum';

// DTO для роли
export class RoleDto {
  @IsString()
  @IsEnum(RoleName, {
    message:
      'Role name must be one of the following: admin, user, moderator, guest',
  })
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Указывает, что массив состоит из строк
  @IsEnum(Permission, { each: true, message: 'Invalid permission' })
  permissions: string[];
}
