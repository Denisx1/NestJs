import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ActionTypeEnum } from '../enums/actionType.enum';
import { IActionToken } from '../interfaces/action-token-interface';

@Schema()
export class ActionToken {
  @Prop({ type: Types.ObjectId, ref: 'User', trim: true, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  token: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ActionTypeEnum),
  })
  actionType: string;
}

export const ActionTokenSchema = SchemaFactory.createForClass(ActionToken);
// Типизированный документ
export type AuthDocument = HydratedDocument<IActionToken>;
