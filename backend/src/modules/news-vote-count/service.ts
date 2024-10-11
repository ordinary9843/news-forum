import { inspect } from 'util';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';

import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCountEntity } from '../../entities/news-vote-count/entity.js';

import { IncreaseVoteCountParams, IncreaseVoteCountResult } from './type.js';

@Injectable()
export class NewsVoteCountService {
  private readonly logger = new Logger(NewsVoteCountService.name);

  constructor(
    @InjectRepository(NewsVoteCountEntity)
    readonly newsVoteCountRepository: Repository<NewsVoteCountEntity>,
    private dataSource: DataSource,
  ) {}

  async increaseVoteCount(
    params: IncreaseVoteCountParams,
  ): Promise<IncreaseVoteCountResult> {
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

      if (_.has(voteCountMap, bias)) {
        const existingVoteCount = voteCountMap[bias];
        existingVoteCount.count += 1;
        await this.newsVoteCountRepository.save(existingVoteCount);
      } else {
        for (const currBias of Object.values(Bias)) {
          await this.newsVoteCountRepository.save(
            this.newsVoteCountRepository.create({
              newsId,
              bias: currBias,
              count: currBias === bias ? 1 : 0,
            }),
          );
        }
      }

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
    }

    await queryRunner.release();

    return {
      fair: voteResult[Bias.FAIR],
      slightlyBiased: voteResult[Bias.SLIGHTLY_BIASED],
      heavilyBiased: voteResult[Bias.HEAVILY_BIASED],
      undetermined: voteResult[Bias.UNDETERMINED],
    };
  }
}
