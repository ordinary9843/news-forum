import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import _ from 'lodash';
import { IsNull, Not, Repository } from 'typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import { DateService } from '../../modules/date/service.js';

import { JsonService } from '../../modules/json/service.js';
import { RedisService } from '../../modules/redis/service.js';

import { GET_NEWS_LIST_CACHE_TTL, GET_NEWS_LIST_LIMIT } from './constant.js';
import { GetNewsListQuery } from './dto.js';
import {
  CreateNewsParams,
  CreateNewsResult,
  DoesNewsExistResult,
  GetNewsListResult,
  UpdateNewsByGuidParams,
  UpdateNewsByGuidResult,
} from './type.js';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    readonly newsRepository: Repository<NewsEntity>,
    private readonly dateService: DateService,
    private readonly redisService: RedisService,
    private readonly jsonService: JsonService,
  ) {}

  async getNewsList(query: GetNewsListQuery): Promise<GetNewsListResult> {
    const cacheKey = this.getNewsListCacheKey(query);
    if (await this.redisService.exists(cacheKey)) {
      return (
        this.jsonService.parse(await this.redisService.get(cacheKey)) || []
      );
    }

    const { page = 1, limit = GET_NEWS_LIST_LIMIT } = query;
    const [items, totalItems] = await this.newsRepository.findAndCount({
      where: {
        link: Not(IsNull()),
        description: Not(IsNull()),
      },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        publishedAt: 'DESC',
      },
    });
    const result = {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      pageItems: items.length,
      page: page,
      items: _.map(items, (item) => {
        return {
          ..._.pick(item, [
            'id',
            'locale',
            'category',
            'link',
            'title',
            'description',
            'source',
            'publishedAt',
          ]),
          publishedAt: this.dateService.format(item.publishedAt),
        };
      }),
    };

    await this.redisService.set(
      cacheKey,
      this.jsonService.stringify(result),
      GET_NEWS_LIST_CACHE_TTL,
    );

    return result;
  }

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
      throw new NotFoundException('News not found');
    }

    Object.assign(existingNews, params);

    return await this.newsRepository.save(existingNews);
  }

  private getNewsListCacheKey(query: GetNewsListQuery) {
    return `get_news_list_${this.jsonService.stringify(query)}`;
  }
}
