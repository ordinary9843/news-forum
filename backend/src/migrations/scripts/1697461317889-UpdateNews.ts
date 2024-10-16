import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

import { NEWS_TABLE } from '../../entities/news/constant.js';

import { DownResult, UpResult } from '../type.js';

export default class UpdateNews1697461317889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    const columnExists = await queryRunner.hasColumn(
      NEWS_TABLE,
      'is_collected',
    );
    if (!columnExists) {
      await queryRunner.addColumn(
        NEWS_TABLE,
        new TableColumn({
          name: 'is_collected',
          type: 'boolean',
          default: false,
        }),
      );
      await queryRunner.query(
        `UPDATE news SET is_collected = true WHERE link IS NOT NULL AND brief IS NOT NULL AND description IS NOT NULL;`,
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
    await queryRunner.dropColumn(NEWS_TABLE, 'is_collected');
  }
}
