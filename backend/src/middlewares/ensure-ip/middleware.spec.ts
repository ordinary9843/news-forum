// npm run test -- ./src/middlewares/ensure-ip/middleware.spec.ts

import { Response, NextFunction } from 'express';

import { Request } from '../../apis/interface';

import { EnsureIpMiddleware } from './middleware';

const mockClientIp = '123.123.123.123';
const mockClientIps = ['123.123.123.123', '124.124.124.124'];
const mockUnknown = 'unknown';

describe('EnsureIpMiddleware', () => {
  let ensureIpMiddleware: EnsureIpMiddleware;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: NextFunction;

  beforeEach(async () => {
    ensureIpMiddleware = new EnsureIpMiddleware();
    request = {};
    response = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should set client ip from x-real-ip header', () => {
    request.headers = { 'x-real-ip': mockClientIp };
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockClientIp);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set client ip from x-forwarded-for header', () => {
    request.headers = {
      'x-forwarded-for': mockClientIps.join(', '),
    };
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockClientIp);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set client ip from x-forwarded-for header (array)', () => {
    request.headers = {
      'x-forwarded-for': mockClientIps,
    };
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockClientIp);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set client ip from request ip if no headers are present', () => {
    request.ip = mockClientIp;
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockClientIp);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set client ip to unknown if no headers and no request ip', () => {
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockUnknown);
    expect(next).toHaveBeenCalled();
  });

  it('should handle missing headers gracefully', () => {
    request.headers = {};
    ensureIpMiddleware.use(request as Request, response as Response, next);
    expect(request.clientIp).toBe(mockUnknown);
    expect(next).toHaveBeenCalled();
  });
});
