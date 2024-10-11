import { inspect } from 'util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';

import { VoteStatistics } from '../../apis/news-vote/dto.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import {
  AnalyzeVoteStatisticsParams,
  AnalyzeVoteStatisticsResult,
  IncreaseVoteCountResult,
  InitializeVoteCountsResult,
} from './type.js';

@Injectable()
export class NewsVoteCountService {
  private readonly logger = new Logger(NewsVoteCountService.name);

  constructor(
    @InjectRepository(NewsVoteCountEntity)
    readonly newsVoteCountRepository: Repository<NewsVoteCountEntity>,
    private dataSource: DataSource,
  ) {}

  async initializeVoteCounts(
    newsId: number,
  ): Promise<InitializeVoteCountsResult> {
    for (const bias of Object.values(Bias)) {
      await this.newsVoteCountRepository.save(
        this.newsVoteCountRepository.create({
          newsId,
          bias,
          count: 0,
        }),
      );
    }
  }

  async analyzeVoteStatistics(
    params: AnalyzeVoteStatisticsParams,
  ): Promise<AnalyzeVoteStatisticsResult> {
    const voteResult = _.mapValues(
      _.keyBy(Object.values(Bias), (bias) => bias),
      () => ({ count: 0, percent: 0 }),
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { newsId, bias } = params;

      this.logger.log(
        `increaseVoteCount(): Prepare update vote count (newsId=${newsId})`,
      );

      const existingVoteCounts = await this.newsVoteCountRepository.find({
        where: { newsId },
      });
      const voteCountMap = _.keyBy(existingVoteCounts, 'bias');
      if (!_.has(voteCountMap, bias)) {
        throw new NotFoundException(
          `Vote count not found for the specified bias`,
        );
      }

      await this.increaseVoteCount(voteCountMap[bias]);

      const totalVotes = _.sumBy(existingVoteCounts, 'count') + 1;
      _.forEach(existingVoteCounts, ({ bias, count }) => {
        const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        voteResult[bias] = {
          count,
          percent: parseFloat(percent.toFixed(0)),
        };
      });

      const totalPercent = _.sumBy(
        existingVoteCounts,
        ({ bias }) => voteResult[bias].percent,
      );
      if (totalPercent !== 100) {
        const adjustment = 100 - totalPercent;
        const maxVoteCountBias = _.maxBy(existingVoteCounts, 'count').bias;
        voteResult[maxVoteCountBias].percent += adjustment;
      }

      this.logger.log(
        `increaseVoteCount(): Successfully updated vote count (newsId=${newsId})`,
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(
        `increaseVoteCount(): Failed to update vote count (error=${inspect(error)})`,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return {
      fair: voteResult[Bias.FAIR],
      slightlyBiased: voteResult[Bias.SLIGHTLY_BIASED],
      heavilyBiased: voteResult[Bias.HEAVILY_BIASED],
      undetermined: voteResult[Bias.UNDETERMINED],
    };
  }

  private async increaseVoteCount(
    existingVoteCount: NewsVoteCountEntity,
  ): Promise<IncreaseVoteCountResult> {
    existingVoteCount.count += 1;
    await this.newsVoteCountRepository.save(existingVoteCount);
  }

  private calculateVotePercentages(
    voteResult: VoteStatistics,
    voteCounts: NewsVoteCountEntity[],
  ) {
    const totalVotes = _.sumBy(voteCounts, 'count') + 1;
    _.forEach(voteCounts, ({ bias, count }) => {
      const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      voteResult[bias] = {
        count,
        percent: parseFloat(percent.toFixed(0)),
      };
    });

    const totalPercent = _.sumBy(
      voteCounts,
      ({ bias }) => voteResult[bias].percent,
    );
    if (totalPercent !== 100) {
      const adjustment = 100 - totalPercent;
      const maxVoteCountBias = _.maxBy(voteCounts, 'count').bias;
      voteResult[maxVoteCountBias].percent += adjustment;
    }
  }
}
