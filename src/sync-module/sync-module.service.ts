import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PostRepository } from '../posts/repositories/postRepository';
import { Types } from 'mongoose';
import { PostUserRepository } from 'src/posts/repositories/postUserRepo';
import { ActionType } from 'src/posts/enums/actionTypeEnum';
import { CommentRepository } from 'src/posts/repositories/commentRepository';
import { UserRepository } from 'src/user/user.repository';
import { ApiError } from 'src/errors/errorhandler';
import { IComment } from 'src/posts/interfaces/commentInterface';

@Injectable()
export class SyncModuleService {
  constructor(
    private readonly redisService: RedisService,
    private readonly postRepo: PostRepository,
    private readonly postUserRepo: PostUserRepository,
    private readonly commentRepo: CommentRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async syncDataRedisToMongoViewsInPost(): Promise<void> {
    const startTime = Date.now();
    // const redisKey = await this.redisService.getKeys('post:*');
    const viewsKeys = await this.redisService.getKeys(`post:*:viewsCount`);
    const likesKeys = await this.redisService.getKeys(`post:*:likes`);
    const usersWhoLikedKey =
      await this.redisService.getKeys(`post:*:usersWhoLiked`);
    const commentsKeys = await this.redisService.getKeys(`post:*:comments`);
    const usersWhoCommentsKeys = await this.redisService.getKeys(
      'post:*:usersWhoCommented',
    );
    // await this.syncDataRedisToMongo(redisKey);
    await this.syncViewsFromRedisToMongo(viewsKeys);
    await this.syncLikesFromRedisToMongo(likesKeys, usersWhoLikedKey);
    await this.syncCommentsFromRedisToMongo(commentsKeys);
    await this.syncUsersWhoCommentedFromRedisToMongo(usersWhoCommentsKeys);

    console.log(
      `Синхронизация завершена за ${(Date.now() - startTime) / 1000} секунд.`,
    );
  }
  private async syncViewsFromRedisToMongo(viewKeys: string[]): Promise<void> {
    const total = viewKeys.length;
    let processed = 0;
    for (const key of viewKeys) {
      const postId = key.split(':')[1];
      const views = await this.redisService.getValue(key);
      if (views) {
        // Преобразуем значение в число, если это необходимо
        const viewsCount = Number(views);

        if (!isNaN(viewsCount)) {
          // Обновляем количество просмотров в MongoDB
          await this.postRepo.updatePostById({
            _id: new Types.ObjectId(postId),
            viewsCount: viewsCount,
          });
          await this.redisService.deleteKeys([
            key,
            `post:${postId}:lastViewed`,
            `post:${postId}`,
          ]);
        } else {
          console.error(
            `Неверное значение просмотров для поста ${postId}: ${views}`,
          );
        }
      }
      processed++;
      this.printProgress('Просмотры', processed, total);
    }
    console.log('Синхронизация просмотров завершена.');
  }

  private async syncLikesFromRedisToMongo(
    likesKeys: string[],
    usersWhoLikedKey: string[],
  ): Promise<void> {
    const total = likesKeys.length;
    let processed = 0;
    for (let i = 0; i < likesKeys.length; i++) {
      const key = likesKeys[i];
      const postId = key.split(':')[1];
      // Получаем количество лайков для поста
      const likes = await this.redisService.getValue(key);
      if (likes) {
        const likesCount = Number(likes);
        if (!isNaN(likesCount) && likesCount >= 0) {
          try {
            const usersWhoLiked = await this.redisService.smembers(
              usersWhoLikedKey[i],
            );
            for (const user of usersWhoLiked) {
              const authorObjectId = new Types.ObjectId(user);
              // Проверяем, ставил ли этот пользователь лайк на этот пост
              const existingLike = await this.postUserRepo.getBySome({
                postId: new Types.ObjectId(postId),
                authorId: authorObjectId,
                actionType: ActionType.LIKE,
              });
              if (!existingLike) {
                await this.postUserRepo.createUniteWithPostAndUser({
                  authorId: authorObjectId,
                  postId: new Types.ObjectId(postId),
                  actionType: ActionType.LIKE,
                });
              }
            }
            // Обновляем количество лайков для поста в MongoDB
            await this.postRepo.updatePostById({
              _id: new Types.ObjectId(postId),
              likesCount: likesCount,
            });
            // Удаляем ключ из Redis после синхронизации
            await this.redisService.deleteKeys([key]);
            await this.redisService.deleteKeys([usersWhoLikedKey[i]]);
            processed++;
            this.printProgress('Лайки', processed, total);
          } catch (error) {
            throw new ApiError(
              `Ошибка при добавлении пользователя  к посту ${postId}:`,
              error,
            );
          }
        } else {
          console.error(
            `Неверное значение лайков для поста ${postId}: ${likes}`,
          );
        }
      }
    }
  }

  private async syncCommentsFromRedisToMongo(commentsKeys: string[]) {
    const total = commentsKeys.length;
    let processed = 0;
    for (const key of commentsKeys) {
      const commentData = await this.redisService.hGetAll(key);
      const comments = Object.values(commentData).map((comment) =>
        JSON.parse(comment),
      );
      // 2. Разделить комментарии на те, которые имеют _id, и те, которые нет
      const { existingComments, newComments } = comments.reduce(
        (acc, comment) => {
          if (comment._id) {
            acc.existingComments.push(comment);
          } else {
            acc.newComments.push({
              ...comment,
              authorId: new Types.ObjectId(comment.authorId),
              postId: new Types.ObjectId(comment.postId),
            });
          }
          return acc;
        },
        {
          existingComments: [] as IComment[],
          newComments: [] as Partial<IComment>[],
        },
      );
      if (existingComments.length > 0) {
        await Promise.all(
          existingComments.map((comment) =>
            this.redisService.hDel(key, comment),
          ),
        );
      }
      if (newComments.length > 0) {
        await Promise.all(
          newComments.map(async (comment) => {
            // Добавляем комментарий в базу
            const newComment = await this.commentRepo.addComment(comment);
            // Обновляем пост: добавляем ID комментария
            await this.postRepo.updatePostById({
              _id: new Types.ObjectId(comment.postId),
              comments: newComment._id,
            }); // Добавляем ID комментария
            // Обновляем пользователя: добавляем ID комментария
            await this.userRepo.updateUser(
              new Types.ObjectId(comment.authorId),
              {
                comments: newComment._id,
              },
            );
          }),
        );
      }

      await this.redisService.deleteKeys([
        key,
        `post:${existingComments[0] ? existingComments[0].postId : newComments[0].postId}:commentIdCounter`,
      ]);
      // Обновляем прогресс
      processed++;
      this.printProgress('Комментарии', processed, total);
    }
    console.log('Синхронизация комментариев завершена.');
  }

  private async syncUsersWhoCommentedFromRedisToMongo(
    usersWhoCommentsKeys: string[],
  ) {
    const total = usersWhoCommentsKeys.length;
    let processed = 0;

    for (const key of usersWhoCommentsKeys) {
      const postId = key.split(':')[1];
      const userWhoCommented = await this.redisService.smembers(key); // Список пользователей из Redis

      if (userWhoCommented.length > 0) {
        // Получаем уже существующие записи для поста и этих пользователей
        const existingRecords = await this.postUserRepo.getByMultiple({
          postId: new Types.ObjectId(postId),
          authorIds: userWhoCommented.map((user) => new Types.ObjectId(user)),
          actionType: ActionType.COMMENT,
        });

        // Составляем множество существующих авторов
        const existingAuthors = new Set(
          existingRecords.map((record) => record.authorId.toString()),
        );

        // Фильтруем пользователей, которых нет в базе
        const usersToAdd = userWhoCommented.filter(
          (user) => !existingAuthors.has(user),
        );

        // Создаем записи для новых пользователей
        if (usersToAdd.length > 0) {
          const tasks = usersToAdd.map((user) =>
            this.postUserRepo.createUniteWithPostAndUser({
              authorId: new Types.ObjectId(user),
              postId: new Types.ObjectId(postId),
              actionType: ActionType.COMMENT,
            }),
          );
          await Promise.all(tasks); // Параллельное выполнение запросов
        }
      }
      await this.redisService.deleteKeys([key]);
      processed++;
      this.printProgress(
        'Пользователи, которые поставили комментарии',
        processed,
        total,
      );
      console.log(
        'Синхронизация пользователей, которые поставили комментарии завершена.',
      );
    }
  }

  // async syncDataRedisToMongo(redisKeys: string[]): Promise<void> {
  //   const total = redisKeys.length;
  //   let processed = 0;

  //   for (const key of redisKeys) {
  //     try {
  //       const postId = key.split(':')[1]; // Получаем ID поста из ключа
  //       const postFromRedis = await this.redisService.getValue(key); // Берем значение по ключу из Redis
  //       console.log(postFromRedis);
  //       if (!postFromRedis) {
  //         console.warn(`Post not found in Redis for key: ${key}`);
  //         continue; // Пропускаем, если поста нет в Redis
  //       }

  //       const updatedData: Partial<IPost> = JSON.parse(postFromRedis);
  //       console.log(updatedData);
  //       // Обновляем данные в базе
  //       await this.postRepo.updatePostById({
  //         _id: new Types.ObjectId(postId),
  //         title: updatedData.title,
  //         content: updatedData.content,
  //       });
  //       await this.redisService.deleteKeys([key]);

  //       processed++;
  //       this.printProgress('Посты', processed, total);
  //     } catch (error) {
  //       console.error(`Error processing key: ${key}`, error.message);
  //       // Логируем ошибку и продолжаем обрабатывать другие ключи
  //     }
  //   }
  // }

  private printProgress(
    taskName: string,
    processed: number,
    total: number,
  ): void {
    const progress = (processed / total) * 100;
    const progressBar = `${taskName}: [${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${progress.toFixed(2)}%`;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(progressBar);
  }
}
