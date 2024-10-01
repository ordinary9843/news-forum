import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import {
  TABLE_NAME,
  REFERENCE_TYPE_ENUM_NAME,
} from '../entities/token/constant';

import { ReferenceType } from '../modules/token/enum';

import { ExistsQuery } from './type';

export class CreateToken1697461317886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists: referenceTypeEnumIsExist }]: ExistsQuery[] =
      (await queryRunner.query(
        `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = '${REFERENCE_TYPE_ENUM_NAME}')`,
      )) as ExistsQuery[];
    if (referenceTypeEnumIsExist) {
      await queryRunner.query(`DROP TYPE "${REFERENCE_TYPE_ENUM_NAME}"`);
    }
    await queryRunner.query(
      `CREATE TYPE "${REFERENCE_TYPE_ENUM_NAME}" AS ENUM(${Object.values(
        ReferenceType,
      )
        .map((tokenType: ReferenceType) => `'${tokenType}'`)
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
            name: 'reference_type',
            type: REFERENCE_TYPE_ENUM_NAME,
            isNullable: true,
          },
          {
            name: 'reference_id',
            type: 'int',
            default: 0,
          },
          {
            name: 'hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expired_at',
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
        ],
        indices: [
          {
            name: 'index:reference_type:reference_id',
            columnNames: ['reference_type', 'reference_id'],
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
