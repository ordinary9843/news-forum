// npm run test -- ./src/guards/permission/guard.spec.ts

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  MOCK_REDIS_SERVICE,
  MOCK_REPOSITORIES,
} from '../../../test/base/test-suite/constants';
import { InitializeResult } from '../../../test/base/test-suite/type';
import { AuthService } from '../../apis/auth/service';

import { ManagerEntity } from '../../entities/manager/entity';

import { RoleEntity } from '../../entities/role/entity';
import { EncryptionService } from '../../modules/encryption/service';
import { JsonService } from '../../modules/json/service';
import { JwtService } from '../../modules/jwt/service';
import { ManagerService } from '../../modules/manager/service';
import { PasswordService } from '../../modules/password/service';

import { RoleService } from '../../modules/role/service';

import { PermissionGuard } from './guard';

const type: string = 'test.type';
const authType: string = 'test.auth.type';
const identifier: string = 'test.identifier';
const permission: string = 'test.permission';
const authScope: string = 'authScope';
const executionContext: ExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => ({
      user: {
        type,
        identifier,
      },
    }),
    getResponse: () => jest.fn(),
  }),
  getHandler: () => ({}),
} as ExecutionContext;

class PermissionGuardTest extends BaseTestSuite {
  private authService: AuthService;
  private permissionGuard: PermissionGuard;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        EncryptionService,
        PasswordService,
        JwtService,
        JsonService,
        ManagerService,
        RoleService,
        PermissionGuard,
        MOCK_REDIS_SERVICE,
        ...MOCK_REPOSITORIES([ManagerEntity, RoleEntity]),
      ],
    }).compile();
    this.authService = this.module.get<AuthService>(AuthService);
    this.permissionGuard = this.module.get<PermissionGuard>(PermissionGuard);
  }

  async runTests(): Promise<InitializeResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('canActivate', () => {
      it('should return true when permission granted', async () => {
        jest
          .spyOn(Reflector.prototype, 'get')
          .mockImplementation((metadataKey: unknown, handler: any) => {
            if (metadataKey === authScope && handler) {
              return { type, permission };
            }
          });
        jest.spyOn(this.authService, 'hasPermission').mockResolvedValue(true);
        expect(await this.permissionGuard.canActivate(executionContext)).toBe(
          true,
        );
        expect(Reflector.prototype.get).toHaveBeenCalledTimes(1);
        expect(this.authService.hasPermission).toHaveBeenCalledWith(
          type,
          identifier,
          permission,
        );
        expect(this.authService.hasPermission).toHaveBeenCalledTimes(1);
      });

      it('should throw forbidden exception when not equal auth & user type', async () => {
        jest
          .spyOn(Reflector.prototype, 'get')
          .mockImplementation((metadataKey: unknown, handler: any) => {
            if (metadataKey === authScope && handler) {
              return { type: authType, permission };
            }
          });
        await expect(
          this.permissionGuard.canActivate(executionContext),
        ).rejects.toThrow(
          new ForbiddenException(
            'Auth type does not match the required permissions',
          ),
        );
        expect(Reflector.prototype.get).toHaveBeenCalledTimes(1);
      });

      it('should throw forbidden exception when permission denied', async () => {
        jest
          .spyOn(Reflector.prototype, 'get')
          .mockImplementation((metadataKey: unknown, handler: any) => {
            if (metadataKey === authScope && handler) {
              return { type, permission };
            }
          });
        jest.spyOn(this.authService, 'hasPermission').mockResolvedValue(false);
        await expect(
          this.permissionGuard.canActivate(executionContext),
        ).rejects.toThrow(new ForbiddenException('No access permission'));
        expect(Reflector.prototype.get).toHaveBeenCalledTimes(1);
        expect(this.authService.hasPermission).toHaveBeenCalledWith(
          type,
          identifier,
          permission,
        );
        expect(this.authService.hasPermission).toHaveBeenCalledTimes(1);
      });
    });
  }
}

new PermissionGuardTest().runTests();
