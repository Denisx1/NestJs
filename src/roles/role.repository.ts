import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schema/role.model';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.Dto';
import { IRole } from './interfaces/roleInterfaces';

@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async createRole(createRole: CreateRoleDto): Promise<IRole> {
    const role = await this.roleModel.create(createRole);
    return role;
  }
  async getAllRoles(): Promise<IRole[]> {
    const roles = await this.roleModel.find();
    return roles;
  }
  async getRoleBySome(filterObject: IRole): Promise<IRole> {
    const role = await this.roleModel.findOne(filterObject);
    return role;
  }
  async updateRole(role: CreateRoleDto): Promise<IRole> {
    const { name, permissions } = role;
    const updatedRole = await this.roleModel.findOneAndUpdate(
      { name },
      { permissions },
      { new: true },
    );
    return updatedRole;
  }
  async deleteRole(name: string): Promise<IRole> {
    const deletedRole = await this.roleModel.findOneAndDelete({ name });
    return deletedRole;
  }
}
