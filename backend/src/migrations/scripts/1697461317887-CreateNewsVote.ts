import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import {
  TIMESTAMP_PRECISION,
  DEFAULT_TIMESTAMP,
} from '../../entities/constant.js';

import {
  BIAS_ENUM_NAME,
  NEWS_VOTE_TABLE,
} from '../../entities/news-vote/constant.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { DownResult, UpResult } from '../type.js';
import { createEnum } from '../util.js';

export class CreateNewsVote1697461317887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    await createEnum(queryRunner, BIAS_ENUM_NAME, Object.values(Bias));
    await queryRunner.createTable(
      new Table({
        name: NEWS_VOTE_TABLE,
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
            name: 'voted_ip',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            default: DEFAULT_TIMESTAMP,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<DownResult> {
    await queryRunner.dropTable(NEWS_VOTE_TABLE);
  }
}
