// npm run test -- ./src/guards/jwt-auth/guard.spec.ts

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import { InitializeResult } from '../../../test/base/test-suite/type';
import { JwtStrategy } from '../../modules/jwt/strategy';

import { JwtAuthGuard } from './guard';

const bearerToken: string = 'test.bearer.token';
const executionContext: ExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => ({
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    }),
    getResponse: () => jest.fn(),
  }),
} as ExecutionContext;

class JwtAuthGuardTest extends BaseTestSuite {
  private jwtAuthGuard: JwtAuthGuard;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
                case 'JWT.SECRET_KEY':
                  return 'test.secret.key';
                default:
                  return null;
              }
            },
          },
        },
      ],
    }).compile();
    this.jwtAuthGuard = this.module.get<JwtAuthGuard>(JwtAuthGuard);
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
      it('should return true when jwt token is valid', async () => {
        jest.spyOn(this.jwtAuthGuard, 'handleRequest').mockResolvedValue(true);
        expect(await this.jwtAuthGuard.canActivate(executionContext)).toBe(
          true,
        );
        expect(this.jwtAuthGuard.handleRequest).toHaveBeenCalledTimes(1);
      });

      it('should throw unauthorized exception when jwt token is invalid', async () => {
        await expect(
          this.jwtAuthGuard.canActivate(executionContext),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  }
}

new JwtAuthGuardTest().runTests();
