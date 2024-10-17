// npm run test -- ./src/apis/news-vote/service.spec.ts

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MOCK_DATA_SOURCE,
  MOCK_REDIS_CLIENT,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { NewsEntity } from '../../entities/news/entity.js';
import { NewsVoteEntity } from '../../entities/news-vote/entity';
import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';
import { DateService } from '../../modules/date/service.js';
import { JsonService } from '../../modules/json/service';
import { NewsVoteCountService } from '../../modules/news-vote-count/service';
import { REDIS_PROVIDER_NAME } from '../../modules/redis/constant.js';
import { RedisService } from '../../modules/redis/service';
import { NewsService } from '../news/service';

import { NewsVoteService } from './service.js';

const mockId = 1;
const mockNewsId = 1;
const mockBias = Bias.FAIR;
const mockVotedIp = 'mock.127.0.0.1';
const mockParams = {
  newsId: mockNewsId,
  bias: mockBias,
  votedIp: mockVotedIp,
};
const mockVoteStatistics = {
  fair: { count: 5, percent: 9 },
  slightlyBiased: { count: 10, percent: 19 },
  heavilyBiased: { count: 33, percent: 64 },
  undetermined: { count: 4, percent: 8 },
};
const mockNewsVoteEntity = Object.assign(new NewsVoteEntity(), {
  id: mockId,
  newsId: mockNewsId,
  bias: mockBias,
  votedIp: mockVotedIp,
});

describe('NewsVoteService', () => {
  let newsVoteService: NewsVoteService;
  let newsVoteRepository: Repository<NewsVoteEntity>;
  let newsService: NewsService;
  let newsVoteCountService: NewsVoteCountService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DateService,
        NewsService,
        NewsVoteService,
        NewsVoteCountService,
        RedisService,
        JsonService,
        MOCK_DATA_SOURCE,
        {
          provide: REDIS_PROVIDER_NAME,
          useValue: MOCK_REDIS_CLIENT,
        },
        ...MOCK_REPOSITORIES([NewsEntity, NewsVoteEntity, NewsVoteCountEntity]),
      ],
    }).compile();

    newsVoteService = module.get<NewsVoteService>(NewsVoteService);
    newsVoteRepository = module.get<Repository<NewsVoteEntity>>(
      getRepositoryToken(NewsVoteEntity),
    );
    newsService = module.get<NewsService>(NewsService);
    newsVoteCountService =
      module.get<NewsVoteCountService>(NewsVoteCountService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('castVote', () => {
    it('should throw BadRequestException if vote already exists', async () => {
      jest.spyOn(newsVoteService, 'doesNewsVoteExist').mockResolvedValue(true);
      await expect(newsVoteService.castVote(mockParams)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if news does not exist', async () => {
      jest.spyOn(newsVoteService, 'doesNewsVoteExist').mockResolvedValue(false);
      jest.spyOn(newsService, 'doesNewsExist').mockResolvedValue(false);
      await expect(newsVoteService.castVote(mockParams)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should save the vote and return vote statistics', async () => {
      jest.spyOn(newsVoteService, 'doesNewsVoteExist').mockResolvedValue(false);
      jest.spyOn(newsService, 'doesNewsExist').mockResolvedValue(true);
      jest
        .spyOn(newsVoteCountService, 'calculateVoteStatistics')
        .mockResolvedValue(mockVoteStatistics);
      jest
        .spyOn(newsVoteRepository, 'create')
        .mockReturnValue(mockNewsVoteEntity);
      jest
        .spyOn(newsVoteRepository, 'save')
        .mockResolvedValue(mockNewsVoteEntity);
      const result = await newsVoteService.castVote(mockParams);
      expect(newsVoteRepository.create).toHaveBeenCalled();
      expect(newsVoteRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockVoteStatistics);
    });
  });

  describe('doesNewsVoteExist', () => {
    it('should return true if vote exists in cache', async () => {
      jest.spyOn(redisService, 'exists').mockResolvedValue(1);
      expect(await newsVoteService.doesNewsVoteExist(mockParams)).toBe(true);
      expect(redisService.exists).toHaveBeenCalledTimes(1);
    });

    it('should return true if vote exists in the database', async () => {
      jest.spyOn(redisService, 'exists').mockResolvedValue(0);
      jest.spyOn(newsVoteRepository, 'count').mockResolvedValue(1);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
      expect(await newsVoteService.doesNewsVoteExist(mockParams)).toBe(true);
      expect(redisService.set).toHaveBeenCalledTimes(1);
    });

    it('should return false if vote does not exist', async () => {
      jest.spyOn(redisService, 'exists').mockResolvedValue(0);
      jest.spyOn(newsVoteRepository, 'count').mockResolvedValue(0);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
      expect(await newsVoteService.doesNewsVoteExist(mockParams)).toBe(false);
      expect(redisService.set).toHaveBeenCalledTimes(1);
    });
  });
});
