import { Config } from '../abstract.config.js';
import { GetConfigResult } from '../type.js';

export default class AppConfig extends Config {
  constructor() {
    super('APP');
  }

  getConfig(): GetConfigResult {
    return {
      SERVER_MODE: process.env.SERVER_MODE,
      ENABLED_SCHEDULE: process.env.ENABLED_SCHEDULE,
      ENABLED_CRAWLER: process.env.ENABLED_CRAWLER,
    };
  }
}
