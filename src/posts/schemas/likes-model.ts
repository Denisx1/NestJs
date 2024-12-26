import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ILikes } from '../interfaces/likesInterface';

@Schema({
  timestamps: true,
})
export class Likes {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;
}

export const LikesSchema = SchemaFactory.createForClass(Likes);
export type LikesDocument = HydratedDocument<ILikes>;
