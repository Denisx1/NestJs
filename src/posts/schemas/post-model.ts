import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPost } from '../interfaces/postInterface';

@Schema({
  timestamps: true,
  toJSON: {
    transform: _postTransformer,
  },
})
export class Post {
  @Prop({ type: String, required: true, trim: true })
  title: string;
  @Prop({ type: String, required: true, trim: true })
  content: string;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  viewsCount: number;
  @Prop({ type: Number, default: 0 })
  likesCount: number;
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: [] })
  comments: Types.ObjectId[];
  @Prop({ type: Array, default: [] })
  photos: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<IPost>;

function _postTransformer(doc: { [key: string]: any }, ret: IPost): IPost {
  delete ret.__v;
  return ret;
}
