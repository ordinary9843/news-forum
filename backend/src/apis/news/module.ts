import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsEntity } from '../../entities/news/entity';

import { NewsController } from './controller';
import { NewsService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
