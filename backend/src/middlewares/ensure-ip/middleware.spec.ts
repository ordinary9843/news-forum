// npm run test -- ./src/middlewares/ensure-ip/middleware.spec.ts

import { Response, NextFunction } from 'express';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';
import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';
import { Request } from '../../apis/interface';

import { EnsureIpMiddleware } from './middleware';

const clientIp: string = '123.123.123.123';
const clientIps: string[] = ['123.123.123.123', '124.124.124.124'];
const unknown: string = 'unknown';

class EnsureIpMiddlewareTest extends BaseTestSuite {
  private ensureIpMiddleware: EnsureIpMiddleware;
  private request: Partial<Request>;
  private response: Partial<Response>;
  private next: NextFunction;

  async initialize(): Promise<InitializeResult> {
    this.ensureIpMiddleware = new EnsureIpMiddleware();
    this.request = {};
    this.response = {};
    this.next = jest.fn();
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should set client ip from x-real-ip header', () => {
      this.request.headers = { 'x-real-ip': clientIp };
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(clientIp);
      expect(this.next).toHaveBeenCalledTimes(1);
    });

    it('should set client ip from x-forwarded-for header', () => {
      this.request.headers = {
        'x-forwarded-for': clientIps.join(', '),
      };
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(clientIp);
      expect(this.next).toHaveBeenCalledTimes(1);
    });

    it('should set client ip from x-forwarded-for header (array)', () => {
      this.request.headers = {
        'x-forwarded-for': clientIps,
      };
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(clientIp);
      expect(this.next).toHaveBeenCalledTimes(1);
    });

    it('should set client ip from request ip if no headers are present', () => {
      this.request.ip = clientIp;
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(clientIp);
      expect(this.next).toHaveBeenCalledTimes(1);
    });

    it('should set client ip to unknown if no headers and no request ip', () => {
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(unknown);
      expect(this.next).toHaveBeenCalled();
    });

    it('should handle missing headers gracefully', () => {
      this.request.headers = {};
      this.ensureIpMiddleware.use(
        this.request as Request,
        this.response as Response,
        this.next,
      );
      expect(this.request.clientIp).toBe(unknown);
      expect(this.next).toHaveBeenCalled();
    });
  }
}

new EnsureIpMiddlewareTest().runTests();
