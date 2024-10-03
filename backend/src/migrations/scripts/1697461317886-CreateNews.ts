import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import {
  DEFAULT_TIMESTAMP,
  TIMESTAMP_PRECISION,
} from '../../entities/constant';
import {
  CATEGORY_ENUM_NAME,
  LOCALE_ENUM_NAME,
  TABLE_NAME,
} from '../../entities/news/constant';

import { Category, Locale } from '../../entities/news/enum';

import { BaseMigration } from '../base.migration';
import { DownResult, UpResult } from '../type';

export class CreateNews1697461317886
  extends BaseMigration
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<UpResult> {
    await this.createEnum(queryRunner, LOCALE_ENUM_NAME, Object.values(Locale));
    await this.createEnum(
      queryRunner,
      CATEGORY_ENUM_NAME,
      Object.keys(Category),
    );
    await queryRunner.createTable(
      new Table({
        name: TABLE_NAME,
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
            name: 'google_link',
            type: 'text',
          },
          {
            name: 'link',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
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
            name: 'is_metadata_retrieved',
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
  }

  public async down(queryRunner: QueryRunner): Promise<DownResult> {
    await queryRunner.dropTable(TABLE_NAME);
  }
}
