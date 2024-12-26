import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../schemas/post-model';
import { Model, Types } from 'mongoose';
import { IPost, IUdatePost } from '../interfaces/postInterface';
import { IGetAllPosts } from '../interfaces/getAllPostsInterface';
import { IFilterToGetPosts } from '../interfaces/queryIntedface';

export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async createPost(post: Partial<IPost>): Promise<IPost> {
    const createdPost = await this.postModel.create({
      ...post,
      authorId: post.authorId,
    });
    return createdPost;
  }
  async getAllPosts(page, limit, skip): Promise<IGetAllPosts> {
    const posts = await this.postModel.find().limit(limit).skip(skip);
    const countOfPost = await this.postModel.countDocuments();
    return { count: countOfPost, page, perPage: limit, posts };
  }
  async getPostById(id: Partial<IPost>): Promise<IPost> {
    const post = await this.postModel
      .findById(id)
      .populate({ path: 'comments', model: 'Comment' })
      .lean();
    return post;
  }
  async deletePostById(postId: Types.ObjectId): Promise<IPost> {
    const deletedPost = await this.postModel.findByIdAndDelete(postId);
    return deletedPost;
  }
  async updatePostById(updateData: Partial<IUdatePost>): Promise<IPost> {
    if (updateData.comments) {
      return await this.postModel.findByIdAndUpdate(
        updateData._id,
        { $push: { comments: updateData.comments } },
        { new: true },
      );
    }
    if (updateData.likesCount) {
      const updateLike = await this.postModel.findByIdAndUpdate(
        updateData._id,
        {
          $set: { likesCount: updateData.likesCount },
        },
        { new: true },
      );
      return updateLike;
    }
    if (updateData.viewsCount) {
      // Увеличиваем счетчик просмотров на 1, если поле viewsCount присутствует
      const updatedPost = await this.postModel.findByIdAndUpdate(
        updateData._id,
        { $set: { viewsCount: updateData.viewsCount } }, // Инкрементируем viewsCount
        { new: true }, // Возвращаем обновленный документ
      );
      return updatedPost;
    }
    const updatedPost = await this.postModel.findByIdAndUpdate(
      updateData._id,
      updateData,
      {
        new: true,
      },
    );
    return updatedPost;
  }
  async getPostsByUserId(
    paramName: IFilterToGetPosts,
    skip: number,
  ): Promise<IGetAllPosts> {
    const query = { authorId: paramName.authorId };
    if (paramName.filterObject) {
      Object.assign(query, paramName.filterObject);
    }

    const posts = await this.postModel
      .find(query)
      .limit(paramName.query.limit)
      .skip(skip);
    const countOfPost = await this.postModel.countDocuments(query);
    return {
      count: countOfPost,
      posts,
      page: paramName.query.page,
      perPage: paramName.query.limit,
    };
  }
}
