import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import { NewsVoteModule } from '../../modules/news-vote/module.js';

import { NewsController } from './controller.js';
import { NewsService } from './service.js';

@Module({
  imports: [NewsVoteModule, TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
