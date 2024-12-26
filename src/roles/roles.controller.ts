import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.Dto';
import { IRole } from './interfaces/roleInterfaces';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}
  @Post('/create')
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    const newRole = await this.roleService.createRole(createRoleDto);
    return newRole;
  }
  @Get('/getAllRoles')
  async getAllRoles(): Promise<IRole[]> {
    const roles = await this.roleService.getAllRoles();
    return roles;
  }
  @Get(':name')
  async getRoleBySome(@Param('name') name: string): Promise<IRole> {
    const role = await this.roleService.getRoleBySome({ name });
    return role;
  }
  @Patch(':name')
  async updateRole(
    @Param('name') name: string,
    updateRoleDto: { permissions: string[] },
  ): Promise<IRole> {
    const updatedRole = await this.roleService.updateRole({
      name,
      permissions: updateRoleDto.permissions,
    });
    return updatedRole;
  }

  @Delete(':name')
  async deleteRole(@Param('name') name: string): Promise<IRole> {
    const deletedRole = await this.roleService.deleteRole(name);
    return deletedRole;
  }
}
