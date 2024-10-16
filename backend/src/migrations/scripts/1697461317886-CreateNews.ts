import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

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
            name: 'is_collected',
            type: 'boolean',
            default: false,
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
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_is_collected',
        columnNames: ['is_collected'],
      }),
    );
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_category',
        columnNames: ['category'],
      }),
    );
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_published_at',
        columnNames: ['published_at'],
      }),
    );
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_is_collected_category',
        columnNames: ['is_collected', 'category'],
      }),
    );
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_is_collected_published_at',
        columnNames: ['is_collected', 'published_at'],
      }),
    );
    await queryRunner.createIndex(
      NEWS_TABLE,
      new TableIndex({
        name: 'idx_news_is_collected_category_published_at',
        columnNames: ['is_collected', 'category', 'published_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<DownResult> {
    await queryRunner.dropIndex(NEWS_TABLE, 'idx_news_is_collected');
    await queryRunner.dropIndex(NEWS_TABLE, 'idx_news_category');
    await queryRunner.dropIndex(NEWS_TABLE, 'idx_news_published_at');
    await queryRunner.dropIndex(NEWS_TABLE, 'idx_news_is_collected_category');
    await queryRunner.dropIndex(
      NEWS_TABLE,
      'idx_news_is_collected_published_at',
    );
    await queryRunner.dropIndex(
      NEWS_TABLE,
      'idx_news_is_collected_category_published_at',
    );
    await queryRunner.dropTable(NEWS_TABLE);
  }
}
