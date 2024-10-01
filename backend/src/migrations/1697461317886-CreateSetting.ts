import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import { TABLE_NAME } from '../entities/setting/constant';

export class CreateSetting1697461317886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            name: 'app_name',
            type: 'varchar',
            length: '90',
            isNullable: false,
          },
          {
            name: 'meta_keyword',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'meta_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'service_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'like_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_closed_app',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            default: DEFAULT_TIMESTAMP,
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            default: DEFAULT_TIMESTAMP,
            isNullable: true,
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
