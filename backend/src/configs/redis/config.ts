import { Config } from '../abstract.config.js';
import { GetConfigResult } from '../type.js';

export default class RedisConfig extends Config {
  constructor() {
    super('REDIS');
  }

  getConfig(): GetConfigResult {
    return {
      HOST: process.env.REDIS_HOST || 'localhost',
      PORT: process.env.REDIS_PORT || 6379,
      PASSWORD: process.env.REDIS_PASSWORD,
    };
  }
}
