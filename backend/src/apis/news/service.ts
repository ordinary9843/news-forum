import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import _ from 'lodash';
import { DateTime } from 'luxon';
import { LessThan, Repository } from 'typeorm';

import { NewsEntity } from '../../entities/news/entity.js';

import { DateService } from '../../modules/date/service.js';

import { JsonService } from '../../modules/json/service.js';
import { NewsVoteCountService } from '../../modules/news-vote-count/service.js';

import { RedisService } from '../../modules/redis/service.js';

import {
  GET_NEWS_LIST_LIMIT,
  LAST_PUBLISHED_AT_CACHE_TTL,
} from './constant.js';
import {
  CreateNewsParams,
  CreateNewsResult,
  DoesNewsExistByGuidResult,
  DoesNewsExistResult,
  GenerateNewsListCacheKeyResult,
  GetLastQueryParams,
  GetLastQueryResult,
  GetNewsListParams,
  GetNewsListResult,
  GetTotalItemsOptions,
  GetTotalItemsResult,
  TransformNewsListParams,
  TransformNewsListResult,
  UpdateLastQueryParams,
  UpdateLastQueryResult,
  UpdateNewsByGuidParams,
  UpdateNewsByGuidResult,
} from './type.js';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    readonly newsRepository: Repository<NewsEntity>,
    private readonly newsVoteCountService: NewsVoteCountService,
    private readonly dateService: DateService,
    private readonly redisService: RedisService,
    private readonly jsonService: JsonService,
  ) {}

  async getNewsList(params: GetNewsListParams): Promise<GetNewsListResult> {
    const { clientIp, reset = false, category = undefined } = params;
    const cacheKey = this.generateLastPublishedAtCacheKey(clientIp);
    const { lastPage, lastPublishedAt } = await this.getLastQuery(cacheKey, {
      reset,
      category,
    });
    const totalItems = await this.getTotalItems({
      category,
    });
    const totalPages = Math.ceil(totalItems / GET_NEWS_LIST_LIMIT);
    let items = [];
    if (lastPage <= totalPages) {
      items = await this.newsRepository.find({
        relations: {
          vote: true,
          voteCounts: true,
        },
        where: {
          isCollected: true,
          ...(lastPublishedAt
            ? {
                publishedAt: LessThan(
                  DateTime.fromJSDate(new Date(lastPublishedAt)).toJSDate(),
                ),
              }
            : {}),
          ...(category ? { category } : {}),
        },
        take: GET_NEWS_LIST_LIMIT,
        order: {
          publishedAt: 'DESC',
          id: 'DESC',
        },
      });
      await this.updateLastQuery(cacheKey, {
        lastPage,
        items,
        category,
      });
    }

    return this.transformNewsList({
      totalItems,
      totalPages,
      lastPage,
      items,
    });
  }

  async doesNewsExist(id: number): Promise<DoesNewsExistResult> {
    return (
      (await this.newsRepository.count({
        where: { id },
      })) > 0
    );
  }

  async doesNewsExistByGuid(guid: string): Promise<DoesNewsExistByGuidResult> {
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

  private generateLastPublishedAtCacheKey(
    clientIp: string,
  ): GenerateNewsListCacheKeyResult {
    return `news_published_at_${clientIp}`;
  }

  private async getLastQuery(
    cacheKey: string,
    params: GetLastQueryParams,
  ): Promise<GetLastQueryResult> {
    const { reset, category } = params;
    let lastPage = 1;
    let lastPublishedAt = undefined;
    if (await this.redisService.exists(cacheKey)) {
      const lastQuery = this.jsonService.parse(
        await this.redisService.get(cacheKey),
      );

      lastPage = _.get(lastQuery, 'lastPage', 1);
      lastPublishedAt = _.get(lastQuery, 'lastPublishedAt');
      const lastCategory = _.get(lastQuery, 'lastCategory');
      if (reset || category !== lastCategory) {
        lastPage = 1;
        lastPublishedAt = undefined;
      }
    }

    return {
      lastPage,
      lastPublishedAt,
    };
  }

  private async updateLastQuery(
    cacheKey: string,
    params: UpdateLastQueryParams,
  ): Promise<UpdateLastQueryResult> {
    const { lastPage, items, category } = params;
    await this.redisService.set(
      cacheKey,
      this.jsonService.stringify({
        lastPage: lastPage + 1,
        lastCategory: category,
        lastPublishedAt: _.get(_.last(items), 'publishedAt', undefined),
      }),
      LAST_PUBLISHED_AT_CACHE_TTL,
    );
  }

  private async getTotalItems(
    options: GetTotalItemsOptions,
  ): Promise<GetTotalItemsResult> {
    const { category } = options;

    return await this.newsRepository.count({
      where: {
        isCollected: true,
        ...(category ? { category } : {}),
      },
    });
  }

  private transformNewsList(
    params: TransformNewsListParams,
  ): TransformNewsListResult {
    const { totalItems, totalPages, lastPage, items } = params;

    return {
      totalItems,
      totalPages,
      page: lastPage,
      items: _.map(items, (item) => {
        const { publishedAt, vote, voteCounts } = item;
        _.unset(item, 'vote');
        _.unset(item, 'voteCounts');

        return {
          ..._.pick(item, [
            'id',
            'locale',
            'category',
            'link',
            'title',
            'brief',
            'description',
            'source',
            'publishedAt',
            'vote',
            'voteCounts',
          ]),
          publishedAt: this.dateService.format(publishedAt),
          isVoted: !_.isEmpty(vote),
          voteStatistics:
            this.newsVoteCountService.calculateVotePercentages(voteCounts),
        };
      }),
    };
  }
}
