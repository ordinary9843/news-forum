import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import {
  DEFAULT_TIMESTAMP,
  TIMESTAMP_PRECISION,
} from '../../entities/constant.js';

import { DownResult, UpResult } from '../type.js';
import { GOOGLE_NEWS_TABLE } from '../../entities/google-news/constant.js';

export default class CreateGoogleNews1697461317886
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    await queryRunner.createTable(
      new Table({
        name: GOOGLE_NEWS_TABLE,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'guid',
            type: 'text',
            isUnique: true,
          },
          {
            name: 'html',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_retrieved',
            type: 'boolean',
            default: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<DownResult> {
    await queryRunner.dropTable(GOOGLE_NEWS_TABLE);
  }
}
