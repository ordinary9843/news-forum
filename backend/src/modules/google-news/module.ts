import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsModule } from '../../apis/news/module.js';
import { GoogleNewsEntity } from '../../entities/google-news/entity.js';

import { NewsVoteCountModule } from '../news-vote-count/module.js';
import { PuppeteerModule } from '../puppeteer/module.js';

import { GoogleNewsService } from './service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleNewsEntity]),
    NewsModule,
    NewsVoteCountModule,
    PuppeteerModule,
  ],
  providers: [GoogleNewsService],
  exports: [GoogleNewsService],
})
export class GoogleNewsModule {}
