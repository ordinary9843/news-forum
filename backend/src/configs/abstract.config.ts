import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
