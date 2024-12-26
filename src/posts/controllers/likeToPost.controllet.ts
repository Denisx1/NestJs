import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LikesService } from '../postService/likes.service';
import { jwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ICustomRequest } from 'src/user/interfaces/userInterface';
import { IPostUserQuery } from '../interfaces/postUserQuery';
import { Types } from 'mongoose';

@Controller('/post/likes')
export class LikeToPostController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(jwtAuthGuard)
  @Post('/:postId')
  async addLike(@Param('postId') postId: string, @Req() req: ICustomRequest) {
    const params: IPostUserQuery = {
      authorId: req.authedUser.userId._id,
      postId: new Types.ObjectId(postId),
    };
    const like = await this.likesService.addLike2(params);
    return like;
  }

  @UseGuards(jwtAuthGuard)
  @Post('/:postId/dislike')
  async deleteLike(
    @Param('postId') postId: string,
    @Req() req: ICustomRequest,
  ) {
    const params: IPostUserQuery = {
      authorId: req.authedUser.userId._id,
      postId: new Types.ObjectId(postId),
    };
    const like = await this.likesService.deleteLike2(params);
    return like;
  }
}
