import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import { NewsVoteCountModule } from '../../modules/news-vote-count/module.js';

import { NewsController } from './controller.js';
import { NewsService } from './service.js';

@Module({
  imports: [NewsVoteCountModule, TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
