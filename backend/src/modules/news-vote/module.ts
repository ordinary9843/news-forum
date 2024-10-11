import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsVoteEntity } from '../../entities/news-vote/entity.js';

import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import { NewsVoteService } from './service.js';

@Module({
  imports: [TypeOrmModule.forFeature([NewsVoteEntity, NewsVoteCountEntity])],
  providers: [NewsVoteService],
  exports: [NewsVoteService],
})
export class NewsVoteModule {}
