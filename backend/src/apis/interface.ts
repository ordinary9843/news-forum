import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
  ip: string;
  clientIp?: string;
  locale?: string;
}

export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
}
