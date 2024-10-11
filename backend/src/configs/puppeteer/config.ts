import { Config } from '../abstract.config.js';
import { GetConfigResult } from '../type.js';

export default class PuppeteerConfig extends Config {
  constructor() {
    super('PUPPETEER');
  }

  getConfig(): GetConfigResult {
    return {
      BIN_PATH: process.env.BIN_PATH,
    };
  }
}
