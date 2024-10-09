import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import {
  CreateNewsParams,
  CreateNewsResult,
  DoesNewsExistResult,
  UpdateNewsByGuidParams,
  UpdateNewsByGuidResult,
} from './type.js';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsEntity)
    readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async doesNewsExist(guid: string): Promise<DoesNewsExistResult> {
    return (
      (await this.newsRepository.count({
        where: { guid },
      })) > 0
    );
  }

  async createNews(params: CreateNewsParams): Promise<CreateNewsResult> {
    return await this.newsRepository.save(this.newsRepository.create(params));
  }

  async updateNewsByGuid(
    guid: string,
    params: UpdateNewsByGuidParams,
  ): Promise<UpdateNewsByGuidResult> {
    const existingNews = await this.newsRepository.findOneBy({ guid });
    if (!existingNews) {
      throw new NotFoundException(`News with GUID ${guid} not found`);
    }

    Object.assign(existingNews, params);

    return await this.newsRepository.save(existingNews);
  }
}
