import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './postService/posts.service';

import { Post, PostSchema } from './schemas/post-model';
import { MongooseModule } from '@nestjs/mongoose';
import { PostRepository } from './repositories/postRepository';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PostAndUser, PostAndUserSchema } from './schemas/postAndUser-model';

import { PostUserRepository } from './repositories/postUserRepo';

import { RedisCustomModule } from 'src/redis/redis.module';
import { LikesService } from './postService/likes.service';

import { LikeToPostController } from './controllers/likeToPost.controllet';
import { Comment, CommentSchema } from './schemas/coments.model';
import { CommentRepository } from './repositories/commentRepository';
import { CommentsService } from './postService/comments.service';
import { CommentToPostController } from './controllers/commentToPostcontroller';

@Module({
  imports: [
    RedisCustomModule,
    AuthModule,
    UserModule,
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: PostAndUser.name, schema: PostAndUserSchema },
    ]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController, LikeToPostController, CommentToPostController],
  providers: [
    PostsService,
    PostRepository,
    PostUserRepository,
    LikesService,
    CommentRepository,
    CommentsService,
  ],
  exports: [
    PostsService,
    PostRepository,
    PostUserRepository,
    CommentRepository,
  ],
})
export class PostsModule {}
