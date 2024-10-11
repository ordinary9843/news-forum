import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

import { GetConfigResult, RegisterConfigResult } from './type.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../../', '.env') });

export abstract class Config {
  constructor(private namespace: string) {}

  registerConfig(): RegisterConfigResult {
    return registerAs(this.namespace, () => this.getConfig());
  }

  abstract getConfig(): GetConfigResult;
}
