import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';

import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PostsModule } from './posts/posts.module';
import { RedisService } from './redis/redis.service';
import { RedisCustomModule } from './redis/redis.module';
import { CronModule } from './cron/cron.module';
import { SyncModuleService } from './sync-module/sync-module.service';
import { SyncModule } from './sync-module/sync-module.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://127.0.0.1:27017/myapp',
      // 'mongodb+srv://denUser:20011975@nebronrocket.vm0hk.mongodb.net/?retryWrites=true&w=majority&appName=HebronRocketNest',
    ),
    UserModule,
    AuthModule,
    RolesModule,
    PostsModule,
    RedisCustomModule,
    CronModule,
    SyncModule,
  ],
  controllers: [],
  providers: [RedisService, SyncModuleService],
})
export class AppModule {}
