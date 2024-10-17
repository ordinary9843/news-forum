// npm run test -- ./src/interceptors/http-response/interceptor.spec.ts

import { ExecutionContext } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpResponseInterceptor } from './interceptor';

const mockSuccess = true;
const mockStatusCode = HttpStatus.OK;
const mockMessage = 'Success';
const mockResult = { key: 'value' };
const mockExecutionContext = {
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: jest.fn().mockReturnValue({
      statusCode: mockStatusCode,
    }),
  }),
} as Partial<ExecutionContext>;
const mockCallHandler = {
  handle: () => of(mockResult),
};

describe('HttpResponseInterceptor', () => {
  let httpResponseInterceptor: HttpResponseInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HttpResponseInterceptor],
    }).compile();
    httpResponseInterceptor = module.get<HttpResponseInterceptor>(
      HttpResponseInterceptor,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should intercept and modify the response', () => {
    httpResponseInterceptor
      .intercept(mockExecutionContext as ExecutionContext, mockCallHandler)
      .pipe(
        map((response: Response) => {
          expect(response).toEqual({
            success: mockSuccess,
            statusCode: mockStatusCode,
            message: mockMessage,
            result: mockResult,
          });
        }),
      )
      .subscribe();
  });
});
