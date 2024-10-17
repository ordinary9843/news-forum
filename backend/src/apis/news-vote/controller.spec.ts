// npm run test -- ./src/apis/news-vote/controller.spec.ts

import { Test } from '@nestjs/testing';

import {
  MOCK_DATA_SOURCE,
  MOCK_REDIS_CLIENT,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { NewsEntity } from '../../entities/news/entity.js';
import { NewsVoteEntity } from '../../entities/news-vote/entity.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';
import { DateService } from '../../modules/date/service.js';
import { JsonService } from '../../modules/json/service.js';
import { NewsVoteCountService } from '../../modules/news-vote-count/service.js';
import { REDIS_PROVIDER_NAME } from '../../modules/redis/constant.js';
import { RedisService } from '../../modules/redis/service.js';
import { Request } from '../interface';

import { NewsService } from '../news/service.js';

import { NewsVoteController } from './controller';
import { NewsVoteService } from './service';

const mockNewsId = 1;
const mockBias = Bias.FAIR;
const mockVotedIp = '127.0.0.1';
const mockBody = { bias: mockBias };
const mockVoteStatistics = {
  fair: { count: 5, percent: 9 },
  slightlyBiased: { count: 10, percent: 19 },
  heavilyBiased: { count: 33, percent: 64 },
  undetermined: { count: 4, percent: 8 },
};
const mockRequest = {
  clientIp: mockVotedIp,
} as Request;

describe('NewsVoteController', () => {
  let newsVoteController: NewsVoteController;
  let newsVoteService: NewsVoteService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NewsVoteController],
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
    newsVoteController = module.get<NewsVoteController>(NewsVoteController);
    newsVoteService = module.get<NewsVoteService>(NewsVoteService);
  });

  describe('castVote', () => {
    it('should successfully cast a vote', async () => {
      jest
        .spyOn(newsVoteService, 'castVote')
        .mockResolvedValue(mockVoteStatistics);
      expect(
        await newsVoteController.castVote(mockRequest, mockNewsId, mockBody),
      ).toEqual(mockVoteStatistics);
      expect(newsVoteService.castVote).toHaveBeenCalledWith({
        ...mockBody,
        newsId: mockNewsId,
        votedIp: mockRequest.clientIp,
      });
    });
  });
});
