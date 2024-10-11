import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

import _ from 'lodash';

import { Request } from '../../apis/interface';
@Injectable()
export class EnsureIpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = _.get(req, 'ip', '');
    const xRealIp = _.get(req?.headers, 'x-real-ip', '');
    const xForwardedFor = _.get(req?.headers, 'x-forwarded-for', '');
    req.clientIp =
      (typeof xRealIp === 'string' && xRealIp
        ? xRealIp
        : typeof xForwardedFor === 'string' && xForwardedFor
          ? _.split(xForwardedFor, ',').shift()
          : _.isArray(xForwardedFor)
            ? xForwardedFor.shift()
            : ip) || 'unknown';
    next();
  }
}
