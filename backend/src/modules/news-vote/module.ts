import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsVoteEntity } from '../../entities/news-vote/entity.js';

import { NewsVoteCountModule } from '../news-vote-count/module.js';

import { NewsVoteService } from './service.js';

@Module({
  imports: [NewsVoteCountModule, TypeOrmModule.forFeature([NewsVoteEntity])],
  providers: [NewsVoteService],
  exports: [NewsVoteService],
})
export class NewsVoteModule {}
