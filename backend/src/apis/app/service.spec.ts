// npm run test -- ./src/apis/app/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  MOCK_REDIS_SERVICE,
  MOCK_REPOSITORIES,
} from '../../../test/base/test-suite/constants';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';
import { RoleEntity } from '../../entities/role/entity';
import { SettingEntity } from '../../entities/setting/entity';
import { JsonService } from '../../modules/json/service';
import { RoleService } from '../../modules/role/service';
import { Setting } from '../../modules/setting/dto';
import { SettingService } from '../../modules/setting/service';

import { Menus, Constants, Options } from '../../modules/setting/type';

import { App } from './dto';
import { ServerMode } from './enum';
import { AppService } from './service';

const appName: string = 'test.app.name';
const metaKeyword: string = 'test.meta.keyword';
const metaDescription: string = 'test.meta.description';
const serverMode: ServerMode = ServerMode.LOCAL;
const serverUrl: string = 'localhost:3000';
const apiUrl: string = 'localhost:3000/api';
const webUrl: string = 'localhost:3333';
const serviceEmail: string = 'test@example.com';
const likeCount: number = 0;
const isClosedApp: boolean = false;
const setting: Setting = {
  appName,
  metaKeyword,
  metaDescription,
  serviceEmail,
  likeCount,
  isClosedApp,
};
const app: App = {
  ...setting,
  serverUrl,
  apiUrl,
  webUrl,
  menus: expect.anything() as Menus,
  constants: expect.anything() as Constants,
  options: expect.anything() as Options,
};

class AppServiceTest extends BaseTestSuite {
  private appService: AppService;
  private settingService: SettingService;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [
        AppService,
        JsonService,
        RoleService,
        SettingService,
        MOCK_REDIS_SERVICE,
        ...MOCK_REPOSITORIES([RoleEntity, SettingEntity]),
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'APP':
                  return {
                    ...setting,
                    serverMode,
                    serverUrl,
                    webUrl,
                  };
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();
    this.appService = this.module.get<AppService>(AppService);
    this.settingService = this.module.get<SettingService>(SettingService);
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('getApp', () => {
      it('should app initialization successful', async () => {
        jest
          .spyOn(this.settingService, 'getConfiguredApp')
          .mockResolvedValue(app);
        expect(await this.appService.getApp()).toEqual(
          expect.objectContaining(app),
        );
        expect(this.settingService.getConfiguredApp).toHaveBeenCalledTimes(1);
      });
    });

    // TODO
    describe('likeApp', () => {});
  }
}

new AppServiceTest().runTests();
