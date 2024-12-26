import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PostsService } from '../postService/posts.service';
import { Reflector } from '@nestjs/core';
import { RedisService } from 'src/redis/redis.service';
import { ApiError } from 'src/errors/errorhandler';
import { IPost } from '../interfaces/postInterface';


@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(
    private readonly postsService: PostsService,
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authedUser = request.authedUser;
      const postId = request.params.id;
      console.log(`post:${postId}`);
      const postFromRedis = await this.redisService.getValue(`post:${postId}`);
      if (!postFromRedis) {
        throw new ApiError('Post not found in Redis', 404);
      }
      const post: IPost = JSON.parse(postFromRedis);
      if (post.authorId.toString() !== authedUser.userId._id.toString()) {
        return false;
      }
      return true;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
