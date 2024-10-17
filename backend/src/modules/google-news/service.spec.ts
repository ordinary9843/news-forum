// npm run test -- ./src/modules/google-news/service.spec.ts

import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, FindOperator } from 'typeorm';

import {
  MOCK_REDIS_CLIENT,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { NewsService } from '../../apis/news/service';
import { GoogleNewsEntity } from '../../entities/google-news/entity';
import { NewsEntity } from '../../entities/news/entity.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';
import { DateService } from '../date/service.js';
import { JsonService } from '../json/service.js';
import { NewsVoteCountService } from '../news-vote-count/service';
import { PuppeteerService } from '../puppeteer/service';

import { REDIS_PROVIDER_NAME } from '../redis/constant.js';
import { RedisService } from '../redis/service.js';

import { SummarizeService } from '../summarize/service.js';

import { GET_PENDING_RETRIEVAL_GOOGLE_NEWS_LIMIT } from './constant.js';
import { GoogleNewsService } from './service.js';

const mockId = 1;
const mockGuid = 'mock.guid';
const mockLink = 'mock.link';
const mockParams = { guid: mockGuid, link: mockLink };
const mockGoogleNewsEntity = Object.assign(new GoogleNewsEntity(), {
  guid: mockGuid,
  link: mockLink,
});

jest.mock('@extractus/article-extractor', () => ({
  extractFromHtml: jest.fn(),
}));

describe('GoogleNewsService', () => {
  let googleNewsService: GoogleNewsService;
  let googleNewsRepository: Repository<GoogleNewsEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        DateService,
        GoogleNewsService,
        JsonService,
        NewsService,
        NewsVoteCountService,
        PuppeteerService,
        RedisService,
        SummarizeService,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: REDIS_PROVIDER_NAME,
          useValue: MOCK_REDIS_CLIENT,
        },
        ...MOCK_REPOSITORIES([
          GoogleNewsEntity,
          NewsEntity,
          NewsVoteCountEntity,
        ]),
      ],
    }).compile();
    googleNewsService = module.get<GoogleNewsService>(GoogleNewsService);
    googleNewsRepository = module.get<Repository<GoogleNewsEntity>>(
      getRepositoryToken(GoogleNewsEntity),
    );
  });

  describe('getPendingRetrievalGoogleNews', () => {
    it('should retrieve pending google news', async () => {
      jest
        .spyOn(googleNewsRepository, 'find')
        .mockResolvedValue([mockGoogleNewsEntity]);
      expect(await googleNewsService.getPendingRetrievalGoogleNews()).toEqual([
        mockGoogleNewsEntity,
      ]);
      expect(googleNewsRepository.find).toHaveBeenCalledWith({
        relations: {
          news: true,
        },
        select: {
          news: {
            title: true,
          },
        },
        where: {
          html: expect.any(FindOperator),
          retrieveCount: expect.any(FindOperator),
        },
        take: GET_PENDING_RETRIEVAL_GOOGLE_NEWS_LIMIT,
      });
      expect(googleNewsRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createGoogleNews', () => {
    it('should create a new google news entity', async () => {
      jest
        .spyOn(googleNewsRepository, 'save')
        .mockResolvedValue(mockGoogleNewsEntity);
      jest
        .spyOn(googleNewsRepository, 'create')
        .mockReturnValue(mockGoogleNewsEntity);
      expect(await googleNewsService.createGoogleNews(mockParams)).toEqual(
        mockGoogleNewsEntity,
      );
      expect(googleNewsRepository.create).toHaveBeenCalledWith(mockParams);
      expect(googleNewsRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateGoogleNews', () => {
    it('should update an existing google news entity', async () => {
      jest
        .spyOn(googleNewsRepository, 'findOneBy')
        .mockResolvedValue(mockGoogleNewsEntity);
      jest
        .spyOn(googleNewsRepository, 'save')
        .mockResolvedValue(mockGoogleNewsEntity);
      expect(
        await googleNewsService.updateGoogleNews(mockId, mockParams),
      ).toEqual(mockGoogleNewsEntity);
      expect(googleNewsRepository.findOneBy).toHaveBeenCalledWith({
        id: mockId,
      });
      expect(googleNewsRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(googleNewsRepository.save).toHaveBeenCalledWith(
        mockGoogleNewsEntity,
      );
      expect(googleNewsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw not found exception if google news entity does not exist', async () => {
      jest.spyOn(googleNewsRepository, 'findOneBy').mockResolvedValue(null);
      await expect(googleNewsService.updateGoogleNews(1, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(googleNewsRepository.findOneBy).toHaveBeenCalledWith({
        id: mockId,
      });
      expect(googleNewsRepository.findOneBy).toHaveBeenCalledTimes(1);
    });
  });
});
