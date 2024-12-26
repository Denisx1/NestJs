import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostAndUser } from '../schemas/postAndUser-model';
import { Model, Types } from 'mongoose';
import { IPostUserQuery } from '../interfaces/postUserQuery';

@Injectable()
export class PostUserRepository {
  constructor(
    @InjectModel(PostAndUser.name) private postUserModel: Model<PostAndUser>,
  ) {}

  async getByMultiple({ postId, authorIds, actionType }) {
    return await this.postUserModel.find({
      postId: postId, // ID поста
      authorId: { $in: authorIds }, // Авторов проверяем через $in
      actionType: actionType, // Тип действия
    });
  }
  async createUniteWithPostAndUser(param: Partial<IPostUserQuery>) {
    console.log(param);
    const createdUnite = await this.postUserModel.create({
      authorId: param.authorId,
      postId: param.postId,
      actionType: param.actionType,
    });
    return createdUnite;
  }
  async getBySome(payload: IPostUserQuery): Promise<IPostUserQuery> {
    const data = await this.postUserModel
      .findOne(payload)
      .populate('postId')
      .exec();
    return data;
  }
  async getUsersWhoLikedPost(
    payload: Partial<IPostUserQuery>,
  ): Promise<IPostUserQuery[]> {
    const users = await this.postUserModel
      .find(
        {
          postId: new Types.ObjectId(payload.postId), // Указываем ID поста
          actionType: payload.actionType,
        },
        { authorId: 1, _id: 1, postId: 1 }, // Выбираем только поле authorId
      )
      .lean(); // Оптимизируем запрос для получения "легких" объектов
    // Возвращаем массив строковых ID пользователей
    return users;
  }

  async deleteUniteWithPostAndUser(query: IPostUserQuery) {
    const { authorId, postId } = query;
    const deletedUnite = await this.postUserModel
      .deleteOne({
        authorId,
        postId,
      })
      .exec();

    return deletedUnite;
  }
}
