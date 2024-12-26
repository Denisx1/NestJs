import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../postService/posts.service';
import { CreatePostDto } from '../dto/createPostDto';
import { jwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ICustomRequest } from 'src/user/interfaces/userInterface';
import { IPost } from '../interfaces/postInterface';
import { UpdatePostDto } from '../dto/updatePostDto';
import { Types } from 'mongoose';
import { IGetAllPosts } from '../interfaces/getAllPostsInterface';
import { IPostUserQuery } from '../interfaces/postUserQuery';
import { IFilterToGetPosts } from '../interfaces/queryIntedface';
import { IPostFromRedis } from '../interfaces/commentInterface';
import { RoleGuard } from 'src/roles/guards/role.guard';
import { Roles } from 'src/roles/decorators/role.decorator';
import { RoleName } from 'src/roles/enums/rols.enum';
import { AuthorGuard } from '../guards/canEditGuard';

@Controller('/post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(jwtAuthGuard)
  @Post('/create')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: ICustomRequest,
  ): Promise<IPost> {
    const createdPost = await this.postsService.createPost({
      authorId: req.authedUser.userId._id,
      ...createPostDto,
    });
    return createdPost;
  }

  @Get('/all')
  async getAllPosts(@Req() req: ICustomRequest): Promise<IGetAllPosts> {
    const posts = await this.postsService.getAllPosts(req.query);
    return posts;
  }

  @Get('/:postId')
  async getPostById(
    @Param('postId') postId: Partial<IPost>,
  ): Promise<IPostFromRedis> {
    const post = await this.postsService.getPostById(postId);
    return post;
  }

  @UseGuards(jwtAuthGuard, RoleGuard, AuthorGuard)
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.USER)
  @Patch('/:id')
  async updatePostById(
    @Param('id') id: string,
    @Body() updateData: UpdatePostDto,
  ) {
    const params: Partial<IPost> = {
      _id: new Types.ObjectId(id),
      ...updateData,
    };
    const updatedPost = await this.postsService.updatePostById(params);
    return updatedPost;
  }

  @Get('/user/:authorId')
  async getPostsByUserId(
    @Param('authorId') authorId: string,
    @Req() req: ICustomRequest,
  ): Promise<IGetAllPosts> {
    const paramField: IFilterToGetPosts = {
      authorId: new Types.ObjectId(authorId),
      query: req.query,
    };
    const posts = await this.postsService.getPostsByUserId(paramField);
    return posts;
  }

  @UseGuards(jwtAuthGuard)
  @Delete('/:postId')
  async deletePostById(
    @Param('postId') postId: string,
    @Req() req: ICustomRequest,
  ): Promise<IPost> {
    const params: IPostUserQuery = {
      authorId: req.authedUser.userId._id,
      postId: new Types.ObjectId(postId),
    };
    const deletedPost = await this.postsService.deletePostById(params);
    return deletedPost;
  }
}
