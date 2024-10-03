import { Injectable } from '@nestjs/common';

import { map } from 'lodash';
import { QueryRunner } from 'typeorm';

import { ExistsQuery } from './type';

@Injectable()
export class BaseMigration {
  protected async createEnum(
    queryRunner: QueryRunner,
    enumName: string,
    enumValues: string[],
  ): Promise<void> {
    const [{ exists }]: ExistsQuery[] = (await queryRunner.query(
      `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = '${enumName}')`,
    )) as ExistsQuery[];
    if (exists) {
      await queryRunner.query(`DROP TYPE "${enumName}"`);
    }

    await queryRunner.query(
      `CREATE TYPE "${enumName}" AS ENUM(${map(
        enumValues || [],
        (value: string) => `'${value}'`,
      ).join(', ')})`,
    );
  }
}
