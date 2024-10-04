import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { DEFAULT_TTL_SECONDS, REDIS_PROVIDER_NAME } from './constant.js';
import { DelResult, ExistsResult, GetResult, SetResult } from './type.js';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_PROVIDER_NAME) private readonly redisClient: Redis,
  ) {}

  async get(key: string): Promise<GetResult> {
    return this.redisClient.get(key);
  }

  async set(
    key: string,
    value: any,
    ttl: number = DEFAULT_TTL_SECONDS,
  ): Promise<SetResult> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async exists(key: string): Promise<ExistsResult> {
    return await this.redisClient.exists(key);
  }

  async del(key: string): Promise<DelResult> {
    return this.redisClient.del(key);
  }
}
