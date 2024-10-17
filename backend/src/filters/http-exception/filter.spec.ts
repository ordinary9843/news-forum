// npm run test -- ./src/filters/http-exception/filter.spec.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HttpExceptionFilter } from './filter';

const mockSuccess = false;
const mockContentType = 'application/json; charset=utf-8';
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};
const mockArgumentsHost = {
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: jest.fn().mockReturnValue(mockResponse),
  }),
};
const mockHttpExceptionMessage = 'mock.http.exception.message';
const mockHttpExceptionStatus = HttpStatus.BAD_REQUEST;
const httpException: HttpException = new HttpException(
  mockHttpExceptionMessage,
  mockHttpExceptionStatus,
);
const mockUnknownExceptionMessage = 'mock.unknown.exception.message';
const mockUnknownExceptionStatus = HttpStatus.INTERNAL_SERVER_ERROR;
const mockUnknownException = new Error(mockUnknownExceptionMessage);

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    httpExceptionFilter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should handle http exception', () => {
    httpExceptionFilter.catch(httpException, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(mockHttpExceptionStatus);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.header).toHaveBeenCalledWith(
      'Content-Type',
      mockContentType,
    );
    expect(mockResponse.header).toHaveBeenCalledTimes(1);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: mockSuccess,
      statusCode: mockHttpExceptionStatus,
      message: mockHttpExceptionMessage,
    });
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
  });

  it('should handle non http exception', () => {
    httpExceptionFilter.catch(mockUnknownException, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      mockUnknownExceptionStatus,
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      'Content-Type',
      mockContentType,
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: mockSuccess,
      statusCode: mockUnknownExceptionStatus,
      message: mockUnknownExceptionMessage,
    });
  });
});
