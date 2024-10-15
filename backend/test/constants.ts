import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import Redis from 'ioredis';

import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';

import { RedisService } from '../src/modules/redis/service.js';

export const MOCK_REDIS_CLIENT = {
  get: jest.fn(),
  set: jest.fn(),
  exists: jest.fn(),
  del: jest.fn(),
} as jest.Mocked<Partial<Redis>>;

export const MOCK_REDIS_SERVICE = {
  provide: RedisService,
  useValue: MOCK_REDIS_CLIENT,
};

export const MOCK_DATA_SOURCE = {
  provide: DataSource,
  useFactory: () => ({
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
  }),
};

export const MOCK_REPOSITORIES = (entities: EntityClassOrSchema[]) => {
  return _.map(entities, (entity: EntityClassOrSchema) => ({
    provide: getRepositoryToken(entity),
    useClass: Repository,
  }));
};
