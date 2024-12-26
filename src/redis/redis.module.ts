// redis.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis'; // Пакет для Redis
import { RedisService } from './redis.service';

@Module({
  imports: [
    RedisModule.forRoot({
      options: {
        host: 'localhost',
        port: 6379,
        db: 0,
        password: '',
      },
      type: 'single',
    }),
  ],
  providers: [RedisService],
  exports: [RedisService], // Экспортируем RedisService для использования в других модулях
})
export class RedisCustomModule {}
