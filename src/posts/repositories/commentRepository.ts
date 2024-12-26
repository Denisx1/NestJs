import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../schemas/coments.model';
import { IComment } from '../interfaces/commentInterface';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}
  async getAllComments(): Promise<IComment[]> {
    const comments = await this.commentModel.find();
    return comments;
  }
  async getBySome(payload: Partial<IComment>): Promise<IComment> {
    const comment = await this.commentModel.findOne(payload);
    return comment;
  }

  async addComment(payload: IComment): Promise<IComment> {
    const comment = await this.commentModel.create(payload);
    return comment;
  }
  async getCommentsBySome(payload: Partial<IComment>): Promise<IComment[]> {
    const comments = await this.commentModel.find(payload);
    return comments;
  }
  async deleteComment(payload: Partial<IComment>): Promise<IComment> {
    const comment = await this.commentModel.findOneAndDelete(payload);
    return comment;
  }
  async updateComment(payload: Partial<IComment>): Promise<IComment> {
    const comment = await this.commentModel.findOneAndUpdate(payload);
    return comment;
  }
}
