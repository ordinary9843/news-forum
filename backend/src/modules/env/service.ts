import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { ServerMode } from '../../apis/app/enum';

import { IsProdResult, IsDevResult, IsLocalResult } from './type';

@Injectable()
export class EnvService {
  private readonly serverMode: ServerMode;

  constructor(private readonly configService: ConfigService) {
    this.serverMode = this.configService.get<ServerMode>('APP.SERVER_MODE');
  }

  isProd(): IsProdResult {
    return this.serverMode === ServerMode.PROD;
  }

  isDev(): IsDevResult {
    return this.serverMode === ServerMode.DEV;
  }

  isLocal(): IsLocalResult {
    return this.serverMode === ServerMode.LOCAL;
  }
}
