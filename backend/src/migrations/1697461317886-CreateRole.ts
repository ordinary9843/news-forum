import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import { TABLE_NAME } from '../entities/role/constant';

export class CreateRole1697461317886 implements MigrationInterface {
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
            name: 'name',
            type: 'varchar',
            length: '90',
            isNullable: false,
          },
          {
            name: 'permission',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_default',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
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
