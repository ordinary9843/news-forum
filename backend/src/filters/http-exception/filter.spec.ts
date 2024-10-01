// npm run test -- ./src/filters/http-exception/filter.spec.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';

import { HttpExceptionFilter } from './filter';

const success: boolean = false;
const contentType: string = 'application/json; charset=utf-8';
const response: Response = {
  status: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as unknown as Response;
const argumentsHost: ArgumentsHost = {
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: jest.fn().mockReturnValue(response),
  }),
} as ArgumentsHost;
const httpExceptionMessage: string = 'test.http.exception.message';
const httpExceptionStatus: HttpStatus = HttpStatus.BAD_REQUEST;
const httpException: HttpException = new HttpException(
  httpExceptionMessage,
  httpExceptionStatus,
);
const unknownExceptionMessage: string = 'test.unknown.exception.message';
const unknownExceptionStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
const unknownException: Error = new Error(unknownExceptionMessage);

class HttpExceptionFilterTest extends BaseTestSuite {
  private httpExceptionFilter: HttpExceptionFilter;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    this.httpExceptionFilter =
      this.module.get<HttpExceptionFilter>(HttpExceptionFilter);
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should handle http exception', () => {
      this.httpExceptionFilter.catch(httpException, argumentsHost);
      expect(response.status).toHaveBeenCalledWith(httpExceptionStatus);
      expect(response.status).toHaveBeenCalledTimes(1);
      expect(response.header).toHaveBeenCalledWith('Content-Type', contentType);
      expect(response.header).toHaveBeenCalledTimes(1);
      expect(response.send).toHaveBeenCalledWith({
        success,
        statusCode: httpExceptionStatus,
        message: httpExceptionMessage,
      });
      expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('should handle non http exception', () => {
      this.httpExceptionFilter.catch(unknownException, argumentsHost);
      expect(response.status).toHaveBeenCalledWith(unknownExceptionStatus);
      expect(response.header).toHaveBeenCalledWith('Content-Type', contentType);
      expect(response.send).toHaveBeenCalledWith({
        success,
        statusCode: unknownExceptionStatus,
        message: unknownExceptionMessage,
      });
    });
  }
}

new HttpExceptionFilterTest().runTests();
