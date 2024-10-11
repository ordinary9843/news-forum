import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import { NewsVoteCountService } from './service.js';

@Module({
  imports: [TypeOrmModule.forFeature([NewsVoteCountEntity])],
  providers: [NewsVoteCountService],
  exports: [NewsVoteCountService],
})
export class NewsVoteCountModule {}
