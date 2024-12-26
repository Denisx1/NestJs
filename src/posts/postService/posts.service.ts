import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/postRepository';
import { IPost } from '../interfaces/postInterface';
import { IQueryParams } from 'src/user/interfaces/queryInterface';
import { IGetAllPosts } from '../interfaces/getAllPostsInterface';
import { ApiError } from 'src/errors/errorhandler';
import { UserService } from 'src/user/user.service';
import { IPostUserQuery } from '../interfaces/postUserQuery';
import { PostUserRepository } from '../repositories/postUserRepo';
import { QueryBuilder } from '../queryBuilder';
import { IFilterToGetPosts } from '../interfaces/queryIntedface';
import { RedisService } from 'src/redis/redis.service';
import { ActionType } from '../enums/actionTypeEnum';
import { CommentRepository } from '../repositories/commentRepository';
import { Types } from 'mongoose';
import { IComment, IPostFromRedis } from '../interfaces/commentInterface';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly userService: UserService,
    private readonly postUserRepo: PostUserRepository,
    private readonly redisService: RedisService,
    private readonly commentRepo: CommentRepository,
  ) {}

  async createPost(payload: Partial<IPost>): Promise<IPost> {
    try {
      const createdPost = await this.postRepo.createPost(payload);
      await this.postUserRepo.createUniteWithPostAndUser({
        authorId: payload.authorId,
        postId: createdPost._id,
        actionType: ActionType.CREATE,
      });
      await this.userService.updateUser(payload.authorId, {
        posts: createdPost._id,
      });
      return createdPost;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async getAllPosts(query: IQueryParams): Promise<IGetAllPosts> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const posts = await this.postRepo.getAllPosts(page, limit, skip);
    return posts;
  }
  private generateRedisKeys(postId: Partial<IPost>) {
    return {
      redisKey: `post:${postId}`,
      viewsKey: `post:${postId}:viewsCount`,
      likesKey: `post:${postId}:likes`,
      usersWhoLikedKey: `post:${postId}:usersWhoLiked`,
      commentsKey: `post:${postId}:comments`,
      usersWhoCommentedKey: `post:${postId}:usersWhoCommented`,
    };
  }

  public async getPostById(postId: Partial<IPost>): Promise<IPostFromRedis> {
    try {
      const keys = this.generateRedisKeys(postId);
      const postFromRedis = await this.redisService.getValue(keys.redisKey);

      if (!postFromRedis) {
        const postFromDb = await this.loadPostFromDbToRedis(postId, keys);
        return postFromDb;
      }

      const post: IPost = JSON.parse(postFromRedis);
      await this.updateViewsInRedis(postId, keys);
      const likesCount = await this.redisService.getValue(keys.likesKey);

      const comments = await this.getCommentsFromRedis(keys.commentsKey);
      const usersWhoLikedPost = await this.redisService.smembers(
        keys.usersWhoLikedKey,
      );
      const usersWhoCommentedPost = await this.redisService.smembers(
        keys.usersWhoCommentedKey,
      );

      return {
        ...post,
        likesCount: likesCount ? parseInt(likesCount, 10) : 0,
        comments,
        usersWhoLikedPost,
        usersWhoCommentedPost,
      };
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
  private async getCommentsFromRedis(commentsKey: string): Promise<IComment[]> {
    const commentsFromRedis = await this.redisService.hGetAll(commentsKey);
    return Object.values(commentsFromRedis).map((comment) =>
      JSON.parse(comment),
    );
  }
  private async loadPostFromDbToRedis(
    postId: Partial<IPost>,
    keys: {
      redisKey: string;
      viewsKey: string;
      likesKey: string;
      usersWhoLikedKey: string;
      commentsKey: string;
      usersWhoCommentedKey: string;
    },
  ): Promise<IPostFromRedis> {
    try {
      const postFromDb = await this.postRepo.getPostById(postId);
      if (!postFromDb) {
        throw new ApiError('Post not found', 404);
      }
      await this.syncLikesWithRedis(postFromDb._id, keys);
      const comments = await this.syncCommentsWithRedis(postFromDb._id, keys);
      await this.redisService.setValue(
        keys.redisKey,
        JSON.stringify(postFromDb),
        86400,
      );
      await this.redisService.setValue(
        keys.viewsKey,
        postFromDb.viewsCount.toString(),
        86400,
      );
      const usersWhoLikedPost = await this.redisService.smembers(
        keys.usersWhoLikedKey,
      );

      const usersWhoCommentedPost = await this.redisService.smembers(
        keys.usersWhoCommentedKey,
      );
      return {
        ...postFromDb,
        comments,
        usersWhoLikedPost,
        usersWhoCommentedPost,
      };
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
  private async syncLikesWithRedis(
    postId: Types.ObjectId,
    keys: { usersWhoLikedKey: string; likesKey: string },
  ) {
    // Проверяем, есть ли список пользователей, поставивших лайк, в Redis
    const usersWhoLikedPost = await this.redisService.smembers(
      keys.usersWhoLikedKey,
    );

    if (usersWhoLikedPost.length === 0) {
      // Если в Redis пусто, загружаем данные из базы
      const usersWhoLiked = await this.postUserRepo.getUsersWhoLikedPost({
        postId,
        actionType: ActionType.LIKE,
      });

      // Получаем количество лайков из базы (или вычисляем его)
      const likesCount = usersWhoLiked.length;

      // Обновляем ключ likesKey в Redis
      await this.redisService.setValue(
        keys.likesKey,
        likesCount.toString(),
        86400,
      ); // TTL: 24 часа

      // Сохраняем список пользователей, поставивших лайк, в Redis
      const uniqueUsers = new Set(
        usersWhoLiked.map((user) => user.authorId.toString()),
      );
      if (uniqueUsers.size > 0) {
        await this.redisService.sadd(
          keys.usersWhoLikedKey,
          ...Array.from(uniqueUsers),
        );
      }
    } else {
      // Если в Redis уже есть данные, обновляем количество лайков на основе размера множества
      const likesCount = usersWhoLikedPost.length;
      await this.redisService.setValue(
        keys.likesKey,
        likesCount.toString(),
        86400,
      );
    }
  }
  private async syncCommentsWithRedis(
    postId: Types.ObjectId,
    keys: { commentsKey: string; usersWhoCommentedKey: string },
  ): Promise<IComment[]> {
    // Указываем, что метод возвращает массив Comment
    const commentsFromRedis = await this.redisService.hGetAll(keys.commentsKey);
    let comments = [];

    if (Object.keys(commentsFromRedis).length === 0) {
      comments = await this.commentRepo.getCommentsBySome({ postId });
      if (!comments.length) return [];
      await Promise.all(
        comments.map((comment) =>
          this.redisService.hset(
            keys.commentsKey,
            comment._id.toString(),
            JSON.stringify(comment),
          ),
        ),
      );

      const usersWhoCommented = comments.map((comment) =>
        comment.authorId.toString(),
      );
      await this.redisService.del(keys.usersWhoCommentedKey);
      await this.redisService.sadd(
        keys.usersWhoCommentedKey,
        ...Array.from(new Set(usersWhoCommented)),
      );
    } else {
      comments = Object.values(commentsFromRedis).map((comment) =>
        JSON.parse(comment),
      );
    }
    return comments;
  }
  private async updateViewsInRedis(
    postId: Partial<IPost>,
    keys: { redisKey: string; viewsKey: string },
  ): Promise<void> {
    const lastViewedKey = `post:${postId}:lastViewed`;
    const lastViewed = await this.redisService.getValue(lastViewedKey);
    const currentTime = Date.now();
    const timeDiff = lastViewed ? currentTime - Number(lastViewed) : Infinity;

    if (timeDiff > 1000) {
      const incrementedViewsCount = await this.redisService.incrementValue(
        keys.viewsKey,
      );
      const post = JSON.parse(await this.redisService.getValue(keys.redisKey));
      post.viewsCount = incrementedViewsCount;

      await this.redisService.setValue(
        keys.redisKey,
        JSON.stringify(post),
        86400,
      );
    }

    await this.redisService.setValue(
      lastViewedKey,
      currentTime.toString(),
      3600,
    );
  }

  async deletePostById(query: IPostUserQuery): Promise<IPost> {
    const { authorId, postId } = query;
    await this.postUserRepo.deleteUniteWithPostAndUser(query);

    const deletedPost = await this.postRepo.deletePostById(postId);
    await this.userService.updateUser(authorId, {
      removePosts: [deletedPost._id],
    });
    return deletedPost;
  }

  async updatePostById(updateData: Partial<IPost>): Promise<IPost> {
    try {
      const redisKey = `post:${new Types.ObjectId(updateData._id)}`;
      const postFromRedis = await this.redisService.getValue(redisKey);
      if (!postFromRedis) {
        throw new ApiError('Post not found in Redis', 404);
      }
      const post: IPost = JSON.parse(postFromRedis);
      post.title = updateData.title;
      post.content = updateData.content;
      await this.redisService.setValue(redisKey, JSON.stringify(post), 86400);
      return post;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async getPostsByUserId(paramField: IFilterToGetPosts): Promise<IGetAllPosts> {
    try {
      if (!paramField.query || typeof paramField.query !== 'object') {
        throw new ApiError('Invalid query structure', 400);
      }
      const { limit = 10, page = 1, ...otherFilters } = paramField.query;
      const validLimit = Math.max(Number(limit), 1); // limit не меньше 1
      const validPage = Math.max(Number(page), 1); // page не меньше 1
      const skip = (validPage - 1) * validLimit;

      // Создание фильтра с использованием QueryBuilder
      const filterObject = new QueryBuilder(otherFilters);
      const filter = filterObject.build();
      paramField.filterObject = filter.filterObject;

      const posts = await this.postRepo.getPostsByUserId(paramField, skip);
      return posts;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
