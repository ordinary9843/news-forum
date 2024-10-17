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

import { GET_NEWS_LIST_LIMIT, LAST_QUERY_CACHE_TTL } from './constant.js';
import {
  CreateNewsParams,
  CreateNewsResult,
  DoesNewsExistByGuidResult,
  DoesNewsExistResult,
  GenerateLastQueryCacheKeyResult,
  ShouldResetQueryParams,
  ShouldResetQueryResult,
  GetNewsListParams,
  GetNewsListResult,
  TransformNewsListParams,
  TransformNewsListResult,
  UpdateLastQueryParams,
  UpdateLastQueryResult,
  UpdateNewsByGuidParams,
  UpdateNewsByGuidResult,
  DecodeNextTokenResult,
  EncodeNextTokenResult,
  IsValidNextTokenResult,
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
    const {
      clientIp,
      reset = false,
      nextToken = null,
      limit = GET_NEWS_LIST_LIMIT,
      category = undefined,
    } = params;
    const cacheKey = this.generateLastQueryCacheKey(clientIp);
    const shouldResetQuery = await this.shouldResetQuery(cacheKey, {
      reset,
      nextToken,
      limit,
      category,
    });
    const decodedNextToken = !shouldResetQuery
      ? this.decodeNextToken(_.get(params, 'nextToken', null))
      : null;
    const items = await this.newsRepository.find({
      relations: {
        vote: true,
        voteCounts: true,
      },
      where: {
        isCollected: true,
        ...(decodedNextToken
          ? {
              publishedAt: LessThan(
                DateTime.fromJSDate(new Date(decodedNextToken)).toJSDate(),
              ),
            }
          : {}),
        ...(category ? { category } : {}),
      },
      take: limit,
      order: {
        publishedAt: 'DESC',
        id: 'DESC',
      },
    });
    await this.updateLastQuery(cacheKey, {
      limit,
      category,
    });

    const lastPublishedAt = _.get(_.last(items), 'publishedAt', null);

    return this.transformNewsList({
      nextToken: this.encodeNextToken(lastPublishedAt || decodedNextToken),
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

  private generateLastQueryCacheKey(
    clientIp: string,
  ): GenerateLastQueryCacheKeyResult {
    return `news_last_query_${clientIp}`;
  }

  private async shouldResetQuery(
    cacheKey: string,
    params: ShouldResetQueryParams,
  ): Promise<ShouldResetQueryResult> {
    const { reset, nextToken, limit, category } = params;
    if (await this.redisService.exists(cacheKey)) {
      const { lastLimit, lastCategory } = this.jsonService.parse(
        await this.redisService.get(cacheKey),
      );
      if (
        reset ||
        !this.isValidNextToken(nextToken) ||
        limit !== lastLimit ||
        category !== lastCategory
      ) {
        return true;
      }
    }

    return false;
  }

  private async updateLastQuery(
    cacheKey: string,
    params: UpdateLastQueryParams,
  ): Promise<UpdateLastQueryResult> {
    const { limit, category } = params;
    await this.redisService.set(
      cacheKey,
      this.jsonService.stringify({
        lastLimit: limit,
        lastCategory: category,
      }),
      LAST_QUERY_CACHE_TTL,
    );
  }

  private encodeNextToken(nextToken: string | null): EncodeNextTokenResult {
    if (!this.isValidNextToken(nextToken)) {
      return null;
    }

    return Buffer.from(nextToken, 'utf-8').toString('base64');
  }

  private decodeNextToken(encodedToken: string | null): DecodeNextTokenResult {
    if (!this.isValidNextToken(encodedToken)) {
      return null;
    }

    return Buffer.from(encodedToken, 'base64').toString('utf-8');
  }

  private isValidNextToken(nextToken: string | null): IsValidNextTokenResult {
    return !(
      _.isNil(nextToken) ||
      nextToken === 'undefined' ||
      nextToken === 'null' ||
      nextToken === ''
    );
  }

  private transformNewsList(
    params: TransformNewsListParams,
  ): TransformNewsListResult {
    const { nextToken, items } = params;

    return {
      nextToken,
      hasItems: items.length > 0,
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
          votedOption: _.get(vote, 'bias', null),
          voteStatistics:
            this.newsVoteCountService.calculateVotePercentages(voteCounts),
        };
      }),
    };
  }
}
