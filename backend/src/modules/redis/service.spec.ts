// npm run test -- ./src/modules/redis/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { MOCK_REDIS_CLIENT } from '../../../test/constants.js';

import { DEFAULT_TTL_SECONDS, REDIS_PROVIDER_NAME } from './constant.js';
import { RedisService } from './service.js';

describe('RedisService', () => {
  let redisService: RedisService;
  const redisClient = MOCK_REDIS_CLIENT;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        RedisService,
        {
          provide: REDIS_PROVIDER_NAME,
          useValue: redisClient,
        },
      ],
    }).compile();
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('should return value from redis', async () => {
      const key = 'test.key';
      const value = 'text.value';
      jest.spyOn(redisClient, 'get').mockResolvedValue(value);
      expect(await redisService.get(key)).toBe(value);
      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(redisClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('set', () => {
    it('should set value to redis', async () => {
      const key = 'test.key';
      const value = 'text.value';
      jest.spyOn(redisClient, 'set').mockResolvedValue(value);
      await redisService.set(key, value);
      expect(redisClient.set).toHaveBeenCalledWith(
        key,
        value,
        'EX',
        DEFAULT_TTL_SECONDS,
      );
      expect(redisClient.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists', () => {
    it('should check if key exists in redis', async () => {
      const key = 'test.key';
      jest.spyOn(redisClient, 'exists').mockResolvedValue(1);
      expect(await redisService.exists(key)).toBe(1);
      expect(redisClient.exists).toHaveBeenCalledWith(key);
      expect(redisClient.exists).toHaveBeenCalledTimes(1);
    });
  });

  describe('del', () => {
    it('should delete key from redis', async () => {
      const key = 'test.key';
      jest.spyOn(redisClient, 'del').mockResolvedValue(1);
      await redisService.del(key);
      expect(redisClient.del).toHaveBeenCalledWith(key);
      expect(redisClient.del).toHaveBeenCalledTimes(1);
    });
  });
});
