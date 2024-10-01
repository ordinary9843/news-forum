// npm run test -- ./src/modules/env/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';
import { ServerMode } from '../../apis/app/enum';

import { EnvService } from './service';

class EnvServiceTest extends BaseTestSuite {
  private envService: EnvService;
  private serverMode: ServerMode;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'APP.SERVER_MODE':
                  return this.serverMode;
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();
    this.envService = this.module.get<EnvService>(EnvService);
  }

  async runTests(): Promise<RunTestsResult> {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('isProd', () => {
      it('should return true when server mode is prod', async () => {
        this.serverMode = ServerMode.PROD;
        await this.initialize();
        expect(this.envService.isProd()).toEqual(true);
        expect(this.envService.isDev()).toEqual(false);
        expect(this.envService.isLocal()).toEqual(false);
      });
    });

    describe('isDev', () => {
      it('should return true when server mode is dev', async () => {
        this.serverMode = ServerMode.DEV;
        await this.initialize();
        expect(this.envService.isProd()).toEqual(false);
        expect(this.envService.isDev()).toEqual(true);
        expect(this.envService.isLocal()).toEqual(false);
      });
    });

    describe('isLocal', () => {
      it('should return true when server mode is local', async () => {
        this.serverMode = ServerMode.LOCAL;
        await this.initialize();
        expect(this.envService.isProd()).toEqual(false);
        expect(this.envService.isDev()).toEqual(false);
        expect(this.envService.isLocal()).toEqual(true);
      });
    });
  }
}

new EnvServiceTest().runTests();
