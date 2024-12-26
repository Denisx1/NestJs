import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from '../postService/comments.service';
import { IComment } from '../interfaces/commentInterface';
import { ICustomRequest } from 'src/user/interfaces/userInterface';
import { jwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateCommentDto } from '../dto/createCommentDto';
import { Types } from 'mongoose';

@Controller('/post')
export class CommentToPostController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId/add/comment')
  @UseGuards(jwtAuthGuard)
  async addCommentToPost(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: ICustomRequest,
  ): Promise<IComment> {
    const params: IComment = {
      postId: new Types.ObjectId(postId),
      authorId: req.authedUser.userId._id,
      comment: createCommentDto.comment,
    };
    const comment = await this.commentsService.addComment(params);
    return comment;
  }
}
