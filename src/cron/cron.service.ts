import { Injectable, OnModuleInit } from '@nestjs/common';
import { SyncModuleService } from 'src/sync-module/sync-module.service';
import * as cron from 'node-cron';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(private readonly syncModuleService: SyncModuleService) {}

  onModuleInit() {
    cron.schedule('*/30 * * * * *', async () => {
      console.log('Starting nightly synchronization...');
      this.syncModuleService.syncDataRedisToMongoViewsInPost();
    });
  }
}
