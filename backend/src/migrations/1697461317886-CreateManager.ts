import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import { TABLE_NAME } from '../entities/manager/constant';

export class CreateManager1697461317886 implements MigrationInterface {
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
            name: 'role_id',
            type: 'int',
            default: 0,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'salt',
            type: 'char',
            length: '32',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'changed_password_ip',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'last_login_ip',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'login_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_sysadmin',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'changed_password_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            precision: TIMESTAMP_PRECISION,
            isNullable: true,
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
