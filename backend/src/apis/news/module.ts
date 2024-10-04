import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import { PuppeteerModule } from '../../modules/puppeteer/module.js';

import { NewsController } from './controller.js';
import { NewsService } from './service.js';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity]), PuppeteerModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
