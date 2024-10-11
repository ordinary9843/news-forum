import { ConfigFactory } from '@nestjs/config';

export type RegisterConfigResult = ConfigFactory;

export type GetConfigResult = Record<string, any>;
