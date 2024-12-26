import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IUser } from '../interfaces/userInterface';

@Schema({
  timestamps: true,
  toJSON: {
    transform: _userTransformer,
  },
})
export class User {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({ type: String, required: true, isRequired: true, trim: true })
  password: string;

  @Prop({ type: Number, min: 0, max: 120 })
  age: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Role' }],
  }) // Ссылка на коллекцию Role
  roles: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Post', default: [] })
  posts: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: [] })
  comments: Types.ObjectId[];
  @Prop({ type: Array<string>, default: [] })
  photos: string[];
}

function _userTransformer(doc: { [key: string]: any }, ret: IUser): IUser {
  delete ret.password;
  delete ret.__v;
  return ret;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<IUser>;
