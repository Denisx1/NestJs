import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IRole } from '../interfaces/roleInterfaces';
export type RoleDocument = HydratedDocument<Role>;

@Schema({
  toJSON: {
    transform: _roleTransformer,
  },
})
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ default: [] })
  permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);

function _roleTransformer(doc: { [key: string]: any }, ret: IRole): IRole {
  delete ret.__v;
  return ret;
}
