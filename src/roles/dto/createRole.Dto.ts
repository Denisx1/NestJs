import { IsArray, IsEnum } from 'class-validator';
import { RoleName } from '../enums/rols.enum';
import { Permission } from '../enums/permissions.enum';

export class CreateRoleDto {
  @IsEnum(RoleName, {
    message:
      'Role name must be one of the following: admin, user, moderator, guest',
  })
  name: RoleName;
  @IsArray()
  @IsEnum(Permission, { each: true, message: 'Invalid permission' })
  permissions: string[];
}
