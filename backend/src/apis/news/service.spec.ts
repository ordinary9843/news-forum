// npm run test -- ./src/apis/news/service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { DateTime } from 'luxon';
import { Repository } from 'typeorm';

import {
  MOCK_DATA_SOURCE,
  MOCK_REDIS_CLIENT,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';
import { NewsVoteEntity } from '../../entities/news-vote/entity.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';
import { DateService } from '../../modules/date/service.js';
import { JsonService } from '../../modules/json/service.js';
import { NewsVoteCountService } from '../../modules/news-vote-count/service.js';
import { REDIS_PROVIDER_NAME } from '../../modules/redis/constant.js';
import { RedisService } from '../../modules/redis/service.js';

import { NewsVoteService } from '../news-vote/service.js';

import { NewsService } from './service.js';

const mockId = 1;
const mockLocale = Locale.ZH_TW;
const mockCategory = Category.BUSINESS;
const mockGuid = 'mock.guid';
const mockLink = 'mock.link';
const mockTitle = 'mock.title';
const mockBrief = 'mock.brief';
const mockDescription = 'mock.description';
const mockSource = 'mock.source';
const mockDate = DateTime.now().toJSDate();
const mockIsCollected = false;
const mockClientIp = '127.0.0.1';
const mockLimit = 10;
const mockRest = false;
const mockNextToken =
  'VGh1IE9jdCAxNyAyMDI0IDA4OjAzOjEyIEdNVCswODAwICjlj7DljJfmqJnmupbmmYLplpMp';
const mockParams = {
  clientIp: mockClientIp,
  limit: mockLimit,
  reset: mockRest,
  nextToken: mockNextToken,
  category: mockCategory,
};
const mockCreateNewsParams = {
  locale: mockLocale,
  category: mockCategory,
  guid: mockGuid,
  title: mockTitle,
  source: mockSource,
  publishedAt: mockDate,
};
const mockUpdateNewsParams = {
  link: mockLink,
  brief: mockBrief,
  description: mockDescription,
  isCollected: mockIsCollected,
};
const mockNewsEntity = Object.assign(new NewsEntity(), {
  id: mockId,
  guid: mockGuid,
  link: mockLink,
  title: mockTitle,
  brief: mockBrief,
  description: mockDescription,
});
const mockLastQuery = { lastLimit: 10, lastCategory: undefined };

describe('NewsService', () => {
  let newsService: NewsService;
  let newsRepository: Repository<NewsEntity>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NewsService,
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
    newsService = module.get<NewsService>(NewsService);
    newsRepository = module.get<Repository<NewsEntity>>(
      getRepositoryToken(NewsEntity),
    );
    redisService = module.get<RedisService>(RedisService);
  });

  describe('getNewsList', () => {
    it('should return a list of news', async () => {
      jest.spyOn(newsRepository, 'find').mockResolvedValue([mockNewsEntity]);
      jest.spyOn(redisService, 'exists').mockResolvedValue(0);
      const result = await newsService.getNewsList(mockParams);
      expect(result).toHaveProperty('nextToken');
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(1);
      expect(newsRepository.find).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return an empty list if no news found', async () => {
      jest.spyOn(newsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(redisService, 'exists').mockResolvedValue(0);
      const result = await newsService.getNewsList(mockParams);
      expect(result).toHaveProperty('nextToken');
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(0);
    });

    it('should handle nextToken and reset query logic', async () => {
      jest.spyOn(newsRepository, 'find').mockResolvedValue([mockNewsEntity]);
      jest.spyOn(redisService, 'exists').mockResolvedValue(1);
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(JSON.stringify(mockLastQuery));
      const result = await newsService.getNewsList(mockParams);
      expect(result).toHaveProperty('nextToken');
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBe(1);
    });

    it('should throw not found exception when trying to update news with invalid GUID', async () => {
      jest.spyOn(newsRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        newsService.updateNewsByGuid(mockGuid, {
          link: mockLink,
          brief: mockBrief,
          description: mockDescription,
          isCollected: mockIsCollected,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('doesNewsExist', () => {
    it('should return true if news exists', async () => {
      jest.spyOn(newsRepository, 'count').mockResolvedValue(1);
      expect(await newsService.doesNewsExist(1)).toBe(true);
      expect(newsRepository.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false if news does not exist', async () => {
      jest.spyOn(newsRepository, 'count').mockResolvedValue(0);
      expect(await newsService.doesNewsExist(2)).toBe(false);
      expect(newsRepository.count).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });
  });

  describe('doesNewsExistByGuid', () => {
    it('should return true if news exists by guid', async () => {
      jest.spyOn(newsRepository, 'count').mockResolvedValue(1);
      expect(await newsService.doesNewsExistByGuid(mockGuid)).toBe(true);
      expect(newsRepository.count).toHaveBeenCalledWith({
        where: { guid: mockGuid },
      });
    });

    it('should return false if news does not exist by guid', async () => {
      jest.spyOn(newsRepository, 'count').mockResolvedValue(0);
      expect(await newsService.doesNewsExistByGuid(mockGuid)).toBe(false);
      expect(newsRepository.count).toHaveBeenCalledWith({
        where: { guid: mockGuid },
      });
    });
  });

  describe('createNews', () => {
    it('should create and return the news item', async () => {
      jest.spyOn(newsRepository, 'create').mockReturnValue(mockNewsEntity);
      jest.spyOn(newsRepository, 'save').mockResolvedValue(mockNewsEntity);
      expect(await newsService.createNews(mockCreateNewsParams)).toEqual(
        mockNewsEntity,
      );
      expect(newsRepository.create).toHaveBeenCalledWith(mockCreateNewsParams);
      expect(newsRepository.save).toHaveBeenCalledWith(mockNewsEntity);
    });
  });

  describe('updateNewsByGuid', () => {
    it('should update the existing news item', async () => {
      jest.spyOn(newsRepository, 'findOneBy').mockResolvedValue(mockNewsEntity);
      jest.spyOn(newsRepository, 'save').mockResolvedValue(mockNewsEntity);
      expect(
        await newsService.updateNewsByGuid(mockGuid, mockUpdateNewsParams),
      ).toEqual(mockNewsEntity);
      expect(newsRepository.findOneBy).toHaveBeenCalledWith({ guid: mockGuid });
      expect(newsRepository.save).toHaveBeenCalledWith(mockNewsEntity);
    });

    it('should throw not found exception if news does not exist', async () => {
      jest.spyOn(newsRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        newsService.updateNewsByGuid(mockGuid, mockUpdateNewsParams),
      ).rejects.toThrow(NotFoundException);
      expect(newsRepository.findOneBy).toHaveBeenCalledWith({ guid: mockGuid });
    });
  });
});
