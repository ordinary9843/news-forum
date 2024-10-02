import { Module } from '@nestjs/common';

import { NewsController } from './controller';
import { NewsService } from './service';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
