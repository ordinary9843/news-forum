import { Config } from '../abstract.config';

export default new (class RedisConfig extends Config {
  constructor() {
    super('REDIS');
  }

  getConfig(): Record<string, any> {
    return {
      HOST: process.env.REDIS_HOST || 'localhost',
      PORT: process.env.REDIS_PORT || 6379,
      PASSWORD: process.env.REDIS_PASSWORD,
    };
  }
})().registerConfig();
