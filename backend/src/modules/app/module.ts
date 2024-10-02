import { BullModule } from '@nestjs/bull';
import { Module, NestModule } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewsModule } from 'src/apis/news/module';

import Configs from '../../configs';
import { dataSourceOptions } from '../../configs/typeorm/config';
import { HttpExceptionFilter } from '../../filters/http-exception/filter';
import { HttpResponseInterceptor } from '../../interceptors/http-response/interceptor';

import { DateModule } from '../date/module';
import { JsonModule } from '../json/module';
import { RedisModule } from '../redis/module';

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
      load: Configs,
    }),
    DateModule,
    NewsModule,
    JsonModule,
    RedisModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSourceOptions,
        entities: [__dirname + '/entities/*/entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ThrottlerModule.forRoot({
      errorMessage: 'Too Many Requests',
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
  configure() {}
}
