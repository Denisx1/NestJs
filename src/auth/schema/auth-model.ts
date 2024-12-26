import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IAuth } from '../interfaces/schemaInterface';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: IAuth): IAuth => {
      delete ret.__v; // Удаляет поле __v при преобразовании в JSON
      return ret;
    },
  },
})
export class Auth {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    type: String,
  })
  accessToken: string;

  @Prop({ type: String })
  refreshToken: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
// Типизированный документ
export type AuthDocument = HydratedDocument<IAuth>;
