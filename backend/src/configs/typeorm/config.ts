import { DataSource, DataSourceOptions } from 'typeorm';

import { Config } from '../abstract.config.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  entities: [path.join(__dirname, '../../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../../migrations/scripts/*.{ts,js}')],
});
