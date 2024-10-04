import { Global, Module } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { REDIS_PROVIDER_NAME } from './constant.js';
import { RedisService } from './service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PROVIDER_NAME,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        return new Redis({
          host: configService.get('REDIS.HOST'),
          port: +configService.get('REDIS.PORT'),
          password: configService.get('REDIS.PASSWORD'),
        });
      },
    },
    RedisService,
  ],
  exports: [REDIS_PROVIDER_NAME, RedisService],
})
export class RedisModule {}
