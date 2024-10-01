// npm run test -- ./src/modules/redis/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import Redis from 'ioredis';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';

import { MOCK_REDIS_CLIENT } from '../../../test/base/test-suite/constants';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';
import { DEFAULT_TTL_SECONDS, REDIS_PROVIDER_NAME } from '../redis/constant';

import { RedisService } from './service';

const key: string = 'test.key';
const value: string = 'text.value';

class RedisServiceTest extends BaseTestSuite {
  private redisService: RedisService;
  private redisClient: jest.Mocked<Redis>;

  async initialize(): Promise<InitializeResult> {
    this.redisClient = MOCK_REDIS_CLIENT;
    this.module = await Test.createTestingModule({
      providers: [
        ConfigService,
        RedisService,
        {
          provide: REDIS_PROVIDER_NAME,
          useValue: this.redisClient,
        },
      ],
    }).compile();
    this.redisService = this.module.get<RedisService>(RedisService);
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('get', () => {
      it('should return value from redis', async () => {
        jest.spyOn(this.redisClient, 'get').mockResolvedValue(value);
        expect(await this.redisService.get(key)).toBe(value);
        expect(this.redisClient.get).toHaveBeenCalledWith(key);
        expect(this.redisClient.get).toHaveBeenCalledTimes(1);
      });
    });

    describe('set', () => {
      it('should set value to redis', async () => {
        jest.spyOn(this.redisClient, 'set').mockResolvedValue(value);
        await this.redisService.set(key, value);
        expect(this.redisClient.set).toHaveBeenCalledWith(
          key,
          value,
          'EX',
          DEFAULT_TTL_SECONDS,
        );
        expect(this.redisClient.set).toHaveBeenCalledTimes(1);
      });
    });

    describe('exists', () => {
      it('should check if key exists in redis', async () => {
        jest.spyOn(this.redisClient, 'exists').mockResolvedValue(1);
        expect(await this.redisService.exists(key)).toBe(1);
        expect(this.redisClient.exists).toHaveBeenCalledWith(key);
        expect(this.redisClient.exists).toHaveBeenCalledTimes(1);
      });
    });

    describe('del', () => {
      it('should delete key from redis', async () => {
        jest.spyOn(this.redisClient, 'del').mockResolvedValue(1);
        await this.redisService.del(key);
        expect(this.redisClient.del).toHaveBeenCalledWith(key);
        expect(this.redisClient.del).toHaveBeenCalledTimes(1);
      });
    });
  }
}

new RedisServiceTest().runTests();
