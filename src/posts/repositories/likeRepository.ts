import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Likes } from '../schemas/likes-model';
import { Model } from 'mongoose';
import { IPostUserQuery } from '../interfaces/postUserQuery';

@Injectable()
export class LikeRepository {
  constructor(@InjectModel(Likes.name) private likeModel: Model<Likes>) {}

  async addLike(params: IPostUserQuery): Promise<IPostUserQuery> {
    const like = await this.likeModel.create(params);
    return like;
  }
  async deleteLike(params: IPostUserQuery): Promise<IPostUserQuery> {
    const like = await this.likeModel.findOneAndDelete(params);
    return like;
  }
  async findLike(params: IPostUserQuery): Promise<IPostUserQuery> {
    const like = await this.likeModel.findOne(params);
    return like;
  }
}
