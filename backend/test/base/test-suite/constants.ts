import { Provider } from '@nestjs/common';

import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import Redis from 'ioredis';
import { map } from 'lodash';

import { Repository } from 'typeorm';

import { RedisService } from '../../../src/modules/redis/service';

export const MOCK_REDIS_CLIENT: jest.Mocked<Redis> = {
  get: jest.fn(),
  set: jest.fn(),
  exists: jest.fn(),
  del: jest.fn(),
} as unknown as jest.Mocked<Redis>;

export const MOCK_REDIS_SERVICE: Provider = {
  provide: RedisService,
  useValue: MOCK_REDIS_CLIENT,
};

export const MOCK_REPOSITORIES = (
  entities: EntityClassOrSchema[],
): Provider[] => {
  return map(entities, (entity: EntityClassOrSchema) => ({
    provide: getRepositoryToken(entity),
    useClass: Repository,
  }));
};
