// npm run test -- ./src/interceptors/http-response/interceptor.spec.ts

import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';

import { HttpResponseInterceptor } from './interceptor';

const success: boolean = true;
const statusCode: HttpStatus = HttpStatus.OK;
const message: string = 'Success';
const data: Record<string, unknown> = { key: 'value' };
const executionContext: Partial<ExecutionContext> = {
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: jest.fn().mockReturnValue({
      statusCode,
    } as unknown as Response),
  }),
};
const callHandler: Partial<CallHandler> = {
  handle: () => of(data),
};

class HttpResponseInterceptorTest extends BaseTestSuite {
  private httpResponseInterceptor: HttpResponseInterceptor;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [HttpResponseInterceptor],
    }).compile();
    this.httpResponseInterceptor = this.module.get<HttpResponseInterceptor>(
      HttpResponseInterceptor,
    );
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should intercept and modify the response', () => {
      this.httpResponseInterceptor
        .intercept(
          executionContext as ExecutionContext,
          callHandler as CallHandler,
        )
        .pipe(
          map((response: Response) => {
            expect(response).toEqual({
              success,
              statusCode,
              message,
              data,
            });
          }),
        )
        .subscribe();
    });
  }
}

new HttpResponseInterceptorTest().runTests();
