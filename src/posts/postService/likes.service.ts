import { Injectable } from '@nestjs/common';
import { PostUserRepository } from '../repositories/postUserRepo';
import { RedisService } from 'src/redis/redis.service';
import { ApiError } from 'src/errors/errorhandler';
import { PostRepository } from '../repositories/postRepository';
import { IPostUserQuery } from '../interfaces/postUserQuery';
import { IPost } from '../interfaces/postInterface';

@Injectable()
export class LikesService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly postUserRepo: PostUserRepository,
    private readonly redisService: RedisService,
  ) {}
  async addLike2(schema: IPostUserQuery): Promise<number> {
    try {
      const { postId, authorId } = schema;
      const redisKey = `post:${postId}`;
      const likeKey = `post:${postId}:likes`;
      const usersWhoLikedKey = `post:${postId}:usersWhoLiked`;

      // Проверяем, если пост есть в Redis
      const postFromRedis = await this.redisService.getValue(redisKey);
      if (!postFromRedis) {
        // Если пост не найден в Redis, можно просто вернуть ошибку или выполнить другие действия
        throw new ApiError('Post not found in Redis', 404);
      }
      // Проверяем, если пользователь уже поставил лайк
      const likeIsPresentInRedis = await this.redisService.sismember(
        usersWhoLikedKey,
        authorId.toString(),
      );
      if (likeIsPresentInRedis) {
        throw new ApiError('User already liked this post', 400);
      }
      // Увеличиваем счетчик лайков в Redis
      const incrementedLikes = await this.redisService.incrementValue(likeKey);
      // Обновляем количество лайков в Redis
      const post: IPost = JSON.parse(postFromRedis);
      post.likesCount = incrementedLikes;

      // Сохраняем обновленный пост в Redis
      await this.redisService.setValue(
        redisKey,
        JSON.stringify(post),
        24 * 60 * 60,
      );
      // Добавляем пользователя в список лайкнувших
      await this.redisService.sadd(usersWhoLikedKey, authorId.toString());

      return incrementedLikes;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async deleteLike2(schema: IPostUserQuery): Promise<number> {
    try {
      const { postId, authorId } = schema;
      const redisKey = `post:${postId}`;
      const likeKey = `post:${postId}:likes`;
      const usersWhoLikedKey = `post:${postId}:usersWhoLiked`;

      // Попытка получить пост из Redis
      const postFromRedis = await this.redisService.getValue(redisKey);

      if (!postFromRedis) {
        // Если поста нет в Redis, загружаем из базы данных
        throw new ApiError('Post not found', 404);
      }

      // Проверяем наличие лайка в Redis
      const likeIsPresentInRedis = await this.redisService.isMember(
        usersWhoLikedKey,
        authorId.toString(),
      );

      // Если лайк не найден ни в Redis, ни в базе данных, выбрасываем ошибку
      if (!likeIsPresentInRedis) {
        throw new ApiError('User did not like this post', 400);
      }

      // Удаляем лайк из Redis, если он там есть
      if (likeIsPresentInRedis) {
        await this.redisService.removeMember(
          usersWhoLikedKey,
          authorId.toString(),
        );
        await this.redisService.decrementValue(likeKey);
      }

      // Обновляем пост в Redis
      const post: IPost = JSON.parse(postFromRedis);
      post.likesCount = parseInt(await this.redisService.getValue(likeKey), 10);

      await this.redisService.setValue(
        redisKey,
        JSON.stringify(post),
        24 * 60 * 60,
      );

      return post.likesCount;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
