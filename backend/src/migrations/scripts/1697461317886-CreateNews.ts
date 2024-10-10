import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import {
  DEFAULT_TIMESTAMP,
  TIMESTAMP_PRECISION,
} from '../../entities/constant.js';
import {
  CATEGORY_ENUM_NAME,
  LOCALE_ENUM_NAME,
  NEWS_TABLE,
} from '../../entities/news/constant.js';

import { Category, Locale } from '../../entities/news/enum.js';

import { DownResult, UpResult } from '../type.js';
import { createEnum } from '../util.js';

export default class CreateNews1697461317886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    await createEnum(queryRunner, LOCALE_ENUM_NAME, Object.values(Locale));
    await createEnum(queryRunner, CATEGORY_ENUM_NAME, Object.keys(Category));
    await queryRunner.createTable(
      new Table({
        name: NEWS_TABLE,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'locale',
            type: LOCALE_ENUM_NAME,
          },
          {
            name: 'category',
            type: CATEGORY_ENUM_NAME,
          },
          {
            name: 'guid',
            type: 'text',
            isUnique: true,
          },
          {
            name: 'link',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'brief',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '128',
          },
          {
            name: 'published_at',
            type: 'timestamp',
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
    await queryRunner.dropTable(NEWS_TABLE);
  }
}
