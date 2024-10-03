import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { Locale } from '../apis/news/enum';
import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import { LOCALE_ENUM_NAME, TABLE_NAME } from '../entities/news/constant';

import { ExistsQuery } from './type';

export class CreateExchangeRate1697461317886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists: doesLocaleEnumExist }]: ExistsQuery[] =
      (await queryRunner.query(
        `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = '${LOCALE_ENUM_NAME}')`,
      )) as ExistsQuery[];
    if (doesLocaleEnumExist) {
      await queryRunner.query(`DROP TYPE "${LOCALE_ENUM_NAME}"`);
    }
    await queryRunner.query(
      `CREATE TYPE "${LOCALE_ENUM_NAME}" AS ENUM(${Object.values(Locale)
        .map((locale: Locale) => `'${locale}'`)
        .join(', ')})`,
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
            name: 'guid',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'link',
            type: 'varchar',
            length: '255',
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
            name: 'is_description_retrieved',
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_NAME);
  }
}
