import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DEFAULT_TIMESTAMP, TIMESTAMP_PRECISION } from '../entities/constant';
import {
  CURRENCY_ENUM_NAME,
  TABLE_NAME,
} from '../entities/exchange-rate/constant';

import { Currency } from '../entities/exchange-rate/enum';

import { ExistsQuery } from './type';

export class CreateExchangeRate1697461317886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists: currencyEnumIsExist }]: ExistsQuery[] =
      (await queryRunner.query(
        `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = '${CURRENCY_ENUM_NAME}')`,
      )) as ExistsQuery[];
    if (currencyEnumIsExist) {
      await queryRunner.query(`DROP TYPE "${CURRENCY_ENUM_NAME}"`);
    }
    await queryRunner.query(
      `CREATE TYPE "${CURRENCY_ENUM_NAME}" AS ENUM(${Object.values(Currency)
        .map((currency: Currency) => `'${currency}'`)
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
            name: 'date',
            type: 'date',
          },
          {
            name: 'from',
            type: CURRENCY_ENUM_NAME,
            isNullable: true,
          },
          {
            name: 'to',
            type: CURRENCY_ENUM_NAME,
            isNullable: true,
          },
          {
            name: 'cash_buy',
            type: 'float',
            default: 0,
          },
          {
            name: 'cash_sell',
            type: 'float',
            default: 0,
          },
          {
            name: 'spot_buy',
            type: 'float',
            default: 0,
          },
          {
            name: 'spot_sell',
            type: 'float',
            default: 0,
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
        indices: [
          // TODO
          // {
          //   name: 'index:date',
          //   columnNames: ['date'],
          // },
          {
            name: 'index:date:from:to',
            columnNames: ['date', 'from', 'to'],
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
