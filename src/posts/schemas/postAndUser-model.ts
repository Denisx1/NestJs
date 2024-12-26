import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPostAndUser } from '../interfaces/PostAndUserInterface';
import { ActionType } from '../enums/actionTypeEnum';
import { IPostUserQuery } from '../interfaces/postUserQuery';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, transform: _transform },
})
export class PostAndUser {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId: Types.ObjectId;
  @Prop({ enum: ActionType, required: true })
  actionType: ActionType;
  @Prop({ type: Number, default: 0 })
  commentCount: number;
}

export const PostAndUserSchema = SchemaFactory.createForClass(PostAndUser);
export type PostDocument = HydratedDocument<IPostAndUser>;

function _transform(
  doc: { [key: string]: any },
  ret: IPostUserQuery,
): IPostUserQuery {
  if (ret.actionType !== ActionType.LIKE) {
    delete ret.commentCount;
  }
  return ret;
}
