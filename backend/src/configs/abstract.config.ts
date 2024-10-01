import { join } from 'path';

import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config({ path: join(__dirname, '../../../', '.env') });

export abstract class Config {
  constructor(private namespace: string) {}

  registerConfig() {
    return registerAs(
      this.namespace,
      (): Record<string, any> => this.getConfig(),
    );
  }

  abstract getConfig(): Record<string, any>;
}
