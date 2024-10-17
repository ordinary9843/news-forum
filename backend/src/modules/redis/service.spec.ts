// npm run test -- ./src/modules/redis/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { MOCK_REDIS_CLIENT } from '../../../test/constants.js';

import { DEFAULT_TTL_SECONDS, REDIS_PROVIDER_NAME } from './constant.js';
import { RedisService } from './service.js';

const mockKey = 'mock.key';
const mockValue = 'mock.value';

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
      jest.spyOn(redisClient, 'get').mockResolvedValue(mockValue);
      expect(await redisService.get(mockKey)).toBe(mockValue);
      expect(redisClient.get).toHaveBeenCalledWith(mockKey);
      expect(redisClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('set', () => {
    it('should set value to redis', async () => {
      jest.spyOn(redisClient, 'set').mockResolvedValue(mockValue);
      await redisService.set(mockKey, mockValue);
      expect(redisClient.set).toHaveBeenCalledWith(
        mockKey,
        mockValue,
        'EX',
        DEFAULT_TTL_SECONDS,
      );
      expect(redisClient.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists', () => {
    it('should check if key exists in redis', async () => {
      jest.spyOn(redisClient, 'exists').mockResolvedValue(1);
      expect(await redisService.exists(mockKey)).toBe(1);
      expect(redisClient.exists).toHaveBeenCalledWith(mockKey);
      expect(redisClient.exists).toHaveBeenCalledTimes(1);
    });
  });

  describe('del', () => {
    it('should delete key from redis', async () => {
      jest.spyOn(redisClient, 'del').mockResolvedValue(1);
      await redisService.del(mockKey);
      expect(redisClient.del).toHaveBeenCalledWith(mockKey);
      expect(redisClient.del).toHaveBeenCalledTimes(1);
    });
  });
});
