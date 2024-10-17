// npm run test -- ./src/apis/news/controller.spec.ts

import { Test } from '@nestjs/testing';

import {
  MOCK_DATA_SOURCE,
  MOCK_REDIS_CLIENT,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';
import { NewsVoteEntity } from '../../entities/news-vote/entity.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';
import { DateService } from '../../modules/date/service.js';
import { JsonService } from '../../modules/json/service.js';
import { NewsVoteCountService } from '../../modules/news-vote-count/service.js';
import { REDIS_PROVIDER_NAME } from '../../modules/redis/constant.js';
import { RedisService } from '../../modules/redis/service.js';
import { Request } from '../interface';
import { NewsVoteService } from '../news-vote/service.js';

import { NewsController } from './controller.js';
import { NewsService } from './service.js';
import { GetNewsListResult } from './type.js';

const mockId = 1;
const mockLocale = Locale.ZH_TW;
const mockCategory = Category.BUSINESS;
const mockLink = 'mock.link';
const mockTitle = 'mock.title';
const mockBrief = 'mock.brief';
const mockDescription = 'mock.description';
const mockSource = 'mock.source';
const mockPublishedAt = 'mock.publishedAt';
const mockVotedOption = Bias.FAIR;
const mockVoteStatistics = {
  fair: { count: 5, percent: 9 },
  slightlyBiased: { count: 10, percent: 19 },
  heavilyBiased: { count: 33, percent: 64 },
  undetermined: { count: 4, percent: 8 },
};
const mockClientIp = '127.0.0.1';
const mockRequest = { clientIp: mockClientIp } as Request;
const mockQuery = { reset: 'false', otherParam: 'value' };
const mockItem = {
  id: mockId,
  locale: mockLocale,
  category: mockCategory,
  link: mockLink,
  title: mockTitle,
  brief: mockBrief,
  description: mockDescription,
  source: mockSource,
  publishedAt: mockPublishedAt,
  isVoted: true,
  votedOption: mockVotedOption,
  voteStatistics: mockVoteStatistics,
};
const mockNewsList: GetNewsListResult = {
  nextToken: null,
  hasItems: true,
  items: [mockItem],
};

describe('NewsController', () => {
  let newsController: NewsController;
  let newsService: NewsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NewsController],
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
    newsController = module.get<NewsController>(NewsController);
    newsService = module.get<NewsService>(NewsService);
  });

  describe('getNewsList', () => {
    it('should return news list successfully', async () => {
      jest
        .spyOn(newsService, 'getNewsList')
        .mockResolvedValueOnce(mockNewsList);
      const result = await newsController.getNewsList(mockRequest, mockQuery);
      expect(result).toEqual(mockNewsList);
      expect(newsService.getNewsList).toHaveBeenCalledWith({
        ...mockQuery,
        reset: false,
        clientIp: mockRequest.clientIp,
      });
    });

    // it('should handle a request with reset parameter as true', async () => {
    //   const mockRequest = { clientIp: '127.0.0.1' };
    //   const mockQuery = { reset: 'true', otherParam: 'value' };

    //   const mockResult: GetNewsListResult = {
    //     articles: [],
    //     total: 0,
    //   };

    //   mockNewsService.getNewsList.mockResolvedValueOnce(mockResult);

    //   const result = await newsController.getNewsList(
    //     mockRequest as any,
    //     mockQuery as any,
    //   );

    //   expect(result).toEqual(mockResult);
    //   expect(mockNewsService.getNewsList).toHaveBeenCalledWith({
    //     ...mockQuery,
    //     reset: true,
    //     clientIp: mockRequest.clientIp,
    //   });
    // });

    // it('should call the news service with the correct parameters', async () => {
    //   const mockRequest = { clientIp: '127.0.0.1' };
    //   const mockQuery = { reset: 'false' };

    //   await newsController.getNewsList(mockRequest as any, mockQuery as any);

    //   expect(mockNewsService.getNewsList).toHaveBeenCalledWith({
    //     reset: false,
    //     clientIp: mockRequest.clientIp,
    //   });
    // });
  });
});
