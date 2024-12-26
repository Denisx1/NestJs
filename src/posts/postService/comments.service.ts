import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../repositories/commentRepository';
import { IComment } from '../interfaces/commentInterface';
import { ApiError } from 'src/errors/errorhandler';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepo: CommentRepository,
    private readonly redisService: RedisService,
  ) {}
  async addComment(payload: IComment): Promise<IComment> {
    try {
      const redisKey = `post:${payload.postId}`;
      const commentIdKey: string = `post:${payload.postId}:commentIdCounter`; // Уникальный счетчик для комментариев
      const commentsKey: string = `post:${payload.postId}:comments`; // Хеш для хранения комментариев
      const usersWhoCommentedKey: string = `post:${payload.postId}:usersWhoCommented`; // Множество пользователей, оставивших комментарий

      const postFromRedis = await this.redisService.getValue(redisKey);

      if (!postFromRedis) {
        throw new ApiError('Post not found in Redis', 404);
      }
      const commentIdIncr =
        await this.redisService.incrementValue(commentIdKey);
      // Создаем комментарий, сохраняем его в Redis
      const newCommentData = {
        commentIdIncr,
        authorId: payload.authorId,
        postId: payload.postId,
        comment: payload.comment,
      };
      const commentJson = JSON.stringify(newCommentData);
      // Добавление комментария в хеш Redis
      await this.redisService.hset(
        commentsKey,
        `comment:${commentIdIncr}`,
        commentJson,
      );

      // Добавление пользователя в множество пользователей, оставивших комментарий
      await this.redisService.sadd(
        usersWhoCommentedKey,
        payload.authorId.toString(),
      );

      return newCommentData; // Возвращаем все комментарии
    } catch (e) {
      throw new ApiError(e.message, e.status || 500);
    }
  }
  async deleteComment(payload: Partial<IComment>): Promise<IComment> {
    const comment = await this.commentRepo.deleteComment(payload);
    return comment;
  }
  async getAllComments(): Promise<IComment[]> {
    const comments = await this.commentRepo.getAllComments();
    return comments;
  }
}
