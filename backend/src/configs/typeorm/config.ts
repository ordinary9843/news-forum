import { DataSource, DataSourceOptions } from 'typeorm';

import { Config } from '../abstract.config';

class TypeOrmConfig extends Config {
  constructor() {
    super('TYPEORM');
  }

  getConfig(): Record<string, any> {
    return {
      host: process.env.TYPEORM_HOST || 'localhost',
      port: +process.env.TYPEORM_PORT || 5432,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
    };
  }
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...new TypeOrmConfig().getConfig(),
};

export default new DataSource({
  ...dataSourceOptions,
  entities: ['src/entities/*/entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
});
