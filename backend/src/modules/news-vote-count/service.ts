import { inspect } from 'util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';

import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import {
  CalculateVoteStatisticsParams,
  CalculateVoteStatisticsResult,
  FormatBiasResult,
  IncreaseVoteCountResult,
  InitializeVoteCountsResult,
} from './type.js';

@Injectable()
export class NewsVoteCountService {
  private readonly logger = new Logger(NewsVoteCountService.name);

  constructor(
    @InjectRepository(NewsVoteCountEntity)
    private readonly newsVoteCountRepository: Repository<NewsVoteCountEntity>,
    private readonly dataSource: DataSource,
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

  async calculateVoteStatistics(
    params: CalculateVoteStatisticsParams,
  ): Promise<CalculateVoteStatisticsResult> {
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
      const currentVoteCount = _.find(existingVoteCounts, {
        bias,
      });
      if (!currentVoteCount) {
        throw new NotFoundException(
          `Vote count not found for the specified bias "${bias}"`,
        );
      }

      await this.increaseVoteCount(currentVoteCount);
      const voteStatistics = this.calculateVotePercentages(existingVoteCounts);

      this.logger.log(
        `increaseVoteCount(): Successfully updated vote count (newsId=${newsId})`,
      );
      await queryRunner.commitTransaction();

      return voteStatistics;
    } catch (error) {
      this.logger.error(
        `increaseVoteCount(): Failed to update vote count (error=${inspect(error)})`,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  calculateVotePercentages(
    voteCounts: NewsVoteCountEntity[],
  ): CalculateVoteStatisticsResult {
    const voteStatistics = {
      fair: {
        count: 0,
        percent: 0,
      },
      slightlyBiased: {
        count: 0,
        percent: 0,
      },
      heavilyBiased: {
        count: 0,
        percent: 0,
      },
      undetermined: {
        count: 0,
        percent: 0,
      },
    };
    const totalVotes = _.sumBy(voteCounts, 'count');
    if (totalVotes === 0) {
      return voteStatistics;
    }

    _.forEach(voteCounts, ({ bias, count }) => {
      const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      const formattedBias = this.formatBias(bias);
      if (!_.has(voteStatistics, formattedBias)) {
        throw new NotFoundException(
          `Bias "${formattedBias}" not found in voteStatistics`,
        );
      }

      voteStatistics[formattedBias] = {
        count,
        percent: _.toNumber(percent.toFixed(0)),
      };
    });
    const totalPercent = _.sumBy(
      voteCounts,
      ({ bias }) => voteStatistics[this.formatBias(bias)].percent,
    );
    if (totalPercent !== 100) {
      const maxVoteCountBias = this.formatBias(
        _.maxBy(voteCounts, 'count').bias,
      );
      voteStatistics[maxVoteCountBias].percent += 100 - totalPercent;
    }

    return voteStatistics;
  }

  private async increaseVoteCount(
    voteCount: NewsVoteCountEntity,
  ): Promise<IncreaseVoteCountResult> {
    voteCount.count += 1;
    await this.newsVoteCountRepository.save(voteCount);
  }

  private formatBias(bias: Bias): FormatBiasResult {
    return _.camelCase(bias);
  }
}
