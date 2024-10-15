// npm run test -- ./src/modules/news-vote-count/service.spec.ts

import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MOCK_DATA_SOURCE,
  MOCK_REPOSITORIES,
} from '../../../test/constants.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import { NewsVoteCountService } from './service.js';

describe('NewsVoteCountService', () => {
  let newsVoteCountService: NewsVoteCountService;
  let newsVoteCountRepository: Repository<NewsVoteCountEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NewsVoteCountService,
        MOCK_DATA_SOURCE,
        ...MOCK_REPOSITORIES([NewsVoteCountEntity]),
      ],
    }).compile();
    newsVoteCountService =
      module.get<NewsVoteCountService>(NewsVoteCountService);
    newsVoteCountRepository = module.get<Repository<NewsVoteCountEntity>>(
      getRepositoryToken(NewsVoteCountEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('initializeVoteCounts', () => {
    it('should initialize vote counts for all biases', async () => {
      const newsId = 1;
      const newsVoteCountEntity = Object.assign(new NewsVoteCountEntity(), {
        id: 1,
        newsId,
        bias: Bias.FAIR,
        count: 1,
      });
      jest
        .spyOn(newsVoteCountRepository, 'save')
        .mockResolvedValue(newsVoteCountEntity);
      jest
        .spyOn(newsVoteCountRepository, 'create')
        .mockReturnValue(newsVoteCountEntity);
      await newsVoteCountService.initializeVoteCounts(newsId);
      expect(newsVoteCountRepository.create).toHaveBeenCalledTimes(
        Object.values(Bias).length,
      );
      expect(newsVoteCountRepository.save).toHaveBeenCalledTimes(
        Object.values(Bias).length,
      );
    });
  });

  describe('calculateVoteStatistics', () => {
    it('should throw not found exception if the bias is not found', async () => {
      const params = { newsId: 1, bias: Bias.FAIR };
      jest.spyOn(newsVoteCountRepository, 'find').mockResolvedValueOnce([]);
      await expect(
        newsVoteCountService.calculateVoteStatistics(params),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate vote percentages correctly', async () => {
      const newsId = 1;
      const bias = Bias.FAIR;
      const newsVoteCountEntity = Object.assign(new NewsVoteCountEntity(), {
        id: 1,
        newsId,
        bias,
        count: 1,
      });
      const params = { newsId, bias };
      const voteCounts = [
        { bias: Bias.FAIR, count: 10 },
        { bias: Bias.SLIGHTLY_BIASED, count: 20 },
        { bias: Bias.HEAVILY_BIASED, count: 30 },
        { bias: Bias.UNDETERMINED, count: 40 },
      ] as NewsVoteCountEntity[];
      jest
        .spyOn(newsVoteCountRepository, 'find')
        .mockResolvedValueOnce(voteCounts);
      jest
        .spyOn(newsVoteCountRepository, 'save')
        .mockResolvedValue(newsVoteCountEntity);
      jest
        .spyOn(newsVoteCountRepository, 'create')
        .mockReturnValue(newsVoteCountEntity);
      const voteStatistics =
        await newsVoteCountService.calculateVoteStatistics(params);
      expect(voteStatistics).toEqual({
        fair: { count: 11, percent: 11 },
        slightlyBiased: { count: 20, percent: 20 },
        heavilyBiased: { count: 30, percent: 30 },
        undetermined: { count: 40, percent: 39 },
      });
    });

    it('should handle total votes not equaling 100%', async () => {
      const newsId = 1;
      const bias = Bias.FAIR;
      const newsVoteCountEntity = Object.assign(new NewsVoteCountEntity(), {
        id: 1,
        newsId,
        bias,
        count: 1,
      });
      const params = { newsId, bias };
      const voteCounts = [
        { bias: Bias.FAIR, count: 10 },
        { bias: Bias.SLIGHTLY_BIASED, count: 10 },
        { bias: Bias.HEAVILY_BIASED, count: 10 },
        { bias: Bias.UNDETERMINED, count: 10 },
      ] as NewsVoteCountEntity[];
      jest
        .spyOn(newsVoteCountRepository, 'find')
        .mockResolvedValueOnce(voteCounts);
      jest
        .spyOn(newsVoteCountRepository, 'save')
        .mockResolvedValue(newsVoteCountEntity);
      jest
        .spyOn(newsVoteCountRepository, 'create')
        .mockReturnValue(newsVoteCountEntity);
      const voteStatistics =
        await newsVoteCountService.calculateVoteStatistics(params);
      expect(voteStatistics).toEqual({
        fair: { count: 11, percent: 28 },
        slightlyBiased: { count: 10, percent: 24 },
        heavilyBiased: { count: 10, percent: 24 },
        undetermined: { count: 10, percent: 24 },
      });
    });
  });

  describe('calculateVotePercentages', () => {
    it('should return zero counts and percentages when total votes are zero', () => {
      const result = newsVoteCountService.calculateVotePercentages([]);
      expect(result).toEqual({
        fair: { count: 0, percent: 0 },
        slightlyBiased: { count: 0, percent: 0 },
        heavilyBiased: { count: 0, percent: 0 },
        undetermined: { count: 0, percent: 0 },
      });
    });

    it('should throw NotFoundException when bias is not found in vote statistics', () => {
      expect(() =>
        newsVoteCountService.calculateVotePercentages([
          { bias: 'invalidBias' as Bias, count: 5 },
        ] as NewsVoteCountEntity[]),
      ).toThrow(NotFoundException);
    });
  });
});
