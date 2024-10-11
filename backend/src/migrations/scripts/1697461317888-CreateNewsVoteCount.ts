import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

import {
  TIMESTAMP_PRECISION,
  DEFAULT_TIMESTAMP,
} from '../../entities/constant.js';

import { Bias } from '../../entities/news-vote/enum.js';
import {
  BIAS_ENUM_NAME,
  NEWS_VOTE_COUNT_TABLE,
} from '../../entities/news-vote-count/constant.js';
import { DownResult, UpResult } from '../type.js';
import { createEnum } from '../util.js';

export class CreateNewsVoteCount1697461317888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    await createEnum(queryRunner, BIAS_ENUM_NAME, Object.values(Bias));
    await queryRunner.createTable(
      new Table({
        name: NEWS_VOTE_COUNT_TABLE,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'news_id',
            type: 'int',
          },
          {
            name: 'bias',
            type: BIAS_ENUM_NAME,
          },
          {
            name: 'count',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            default: DEFAULT_TIMESTAMP,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            default: DEFAULT_TIMESTAMP,
          },
        ],
      }),
      true,
    );
    await queryRunner.createUniqueConstraint(
      NEWS_VOTE_COUNT_TABLE,
      new TableUnique({
        name: 'unique:news_id:bias',
        columnNames: ['news_id', 'bias'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<DownResult> {
    await queryRunner.dropTable(NEWS_VOTE_COUNT_TABLE);
  }
}
