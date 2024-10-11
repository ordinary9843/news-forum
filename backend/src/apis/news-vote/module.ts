import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsVoteEntity } from '../../entities/news-vote/entity.js';

import { NewsVoteCountModule } from '../../modules/news-vote-count/module.js';

import { NewsModule } from '../news/module.js';

import { NewsVoteController } from './controller.js';
import { NewsVoteService } from './service.js';

@Module({
  imports: [
    NewsModule,
    NewsVoteCountModule,
    TypeOrmModule.forFeature([NewsVoteEntity]),
  ],
  controllers: [NewsVoteController],
  providers: [NewsVoteService],
  exports: [NewsVoteService],
})
export class NewsVoteModule {}
