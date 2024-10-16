import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { NewsVoteEntity } from '../../entities/news-vote/entity.js';

import { JsonService } from '../../modules/json/service.js';
import { NewsVoteCountService } from '../../modules/news-vote-count/service.js';
import { RedisService } from '../../modules/redis/service.js';

import { NewsService } from '../news/service.js';

import { CAST_VOTE_CACHE_TTL } from './constant.js';
import {
  CastVoteParams,
  CastVoteResult,
  GenerateCastVoteCacheKeyParams,
  DoesNewsVoteExistParams,
  DoesNewsVoteExistResult,
  GenerateCastVoteCacheKeyResult,
} from './type.js';

@Injectable()
export class NewsVoteService {
  constructor(
    @InjectRepository(NewsVoteEntity)
    readonly newsVoteRepository: Repository<NewsVoteEntity>,
    private readonly newsService: NewsService,
    private readonly newsVoteCountService: NewsVoteCountService,
    private readonly redisService: RedisService,
    private readonly jsonService: JsonService,
  ) {}

  async castVote(params: CastVoteParams): Promise<CastVoteResult> {
    const { newsId, bias, votedIp } = params;
    if (
      await this.doesNewsVoteExist({
        newsId,
        votedIp,
      })
    ) {
      throw new BadRequestException('Vote has already been cast for this news');
    } else if (!(await this.newsService.doesNewsExist(newsId))) {
      throw new NotFoundException('News does not exist');
    }

    await this.newsVoteRepository.save(
      this.newsVoteRepository.create({
        newsId,
        bias,
        votedIp,
      }),
    );

    return await this.newsVoteCountService.calculateVoteStatistics({
      newsId,
      bias,
    });
  }

  async doesNewsVoteExist(
    params: DoesNewsVoteExistParams,
  ): Promise<DoesNewsVoteExistResult> {
    const { newsId, votedIp } = params;
    const cacheKey = this.generateCastVoteCacheKey({ newsId, votedIp });
    if (await this.redisService.exists(cacheKey)) {
      return true;
    }

    const doesNewsVoteExist =
      (await this.newsVoteRepository.count({
        where: {
          newsId,
          votedIp,
        },
      })) > 0;

    await this.redisService.set(
      cacheKey,
      doesNewsVoteExist,
      CAST_VOTE_CACHE_TTL,
    );

    return doesNewsVoteExist;
  }

  private generateCastVoteCacheKey(
    params: GenerateCastVoteCacheKeyParams,
  ): GenerateCastVoteCacheKeyResult {
    return `cast_vote_${this.jsonService.stringify(params)}`;
  }
}
