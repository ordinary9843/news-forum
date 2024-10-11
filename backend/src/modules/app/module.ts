import { dirname } from 'path';

import { fileURLToPath } from 'url';

import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsModule } from '../../apis/news/module.js';
import PuppeteerConfig from '../../configs/puppeteer/config.js';
import RedisConfig from '../../configs/redis/config.js';
import { dataSourceOptions } from '../../configs/typeorm/config.js';

import { HttpExceptionFilter } from '../../filters/http-exception/filter.js';
import { HttpResponseInterceptor } from '../../interceptors/http-response/interceptor.js';
import { EnsureIpMiddleware } from '../../middlewares/ensure-ip/middleware.js';
import { DateModule } from '../date/module.js';
import { GoogleNewsModule } from '../google-news/module.js';
import { JsonModule } from '../json/module.js';

import { RedisModule } from '../redis/module.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS.HOST'),
          port: +configService.get('REDIS.PORT'),
          password: configService.get('REDIS.PASSWORD'),
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        new PuppeteerConfig().registerConfig(),
        new RedisConfig().registerConfig(),
      ],
    }),
    DateModule,
    GoogleNewsModule,
    NewsModule,
    JsonModule,
    RedisModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSourceOptions,
        entities: [__dirname + '/entities/*/*.{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ThrottlerModule.forRoot({
      errorMessage: 'Too many requests',
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
  ],
  providers: [
    HttpExceptionFilter,
    HttpResponseInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EnsureIpMiddleware).forRoutes('*');
  }
}
