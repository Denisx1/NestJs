import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/createRole.Dto';
import { IRole } from './interfaces/roleInterfaces';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async createRole(createRole: CreateRoleDto): Promise<IRole> {
    const role = await this.roleRepo.createRole(createRole);
    return role;
  }
  async getAllRoles(): Promise<IRole[]> {
    const roles = await this.roleRepo.getAllRoles();
    return roles;
  }
  async getRoleBySome(filterObject: IRole): Promise<IRole> {
    const role = await this.roleRepo.getRoleBySome(filterObject);
    return role;
  }
  async updateRole(role: CreateRoleDto): Promise<IRole> {
    const updatedRole = await this.roleRepo.updateRole(role);
    return updatedRole;
  }
  async deleteRole(name: string): Promise<IRole> {
    const deletedRole = await this.roleRepo.deleteRole(name);
    return deletedRole;
  }
}
