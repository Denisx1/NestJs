import { Module } from '@nestjs/common';
import { PostsModule } from 'src/posts/posts.module';
import { RedisCustomModule } from 'src/redis/redis.module';
import { SyncModuleService } from './sync-module.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [RedisCustomModule, PostsModule, UserModule],
  providers: [SyncModuleService],
  exports: [SyncModuleService],
})
export class SyncModule {}
