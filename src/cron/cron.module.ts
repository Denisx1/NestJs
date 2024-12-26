import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { SyncModule } from 'src/sync-module/sync-module.module';

@Module({
  imports: [SyncModule],
  providers: [CronService],
})
export class CronModule {}
