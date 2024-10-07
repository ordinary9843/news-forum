import _ from 'lodash';
import { QueryRunner } from 'typeorm';

import { ExistsQuery } from './type.js';

export async function createEnum(
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
    `CREATE TYPE "${enumName}" AS ENUM(${_.map(
      enumValues || [],
      (value: string) => `'${value}'`,
    ).join(', ')})`,
  );
}
