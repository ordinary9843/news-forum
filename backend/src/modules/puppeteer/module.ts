import { Module } from '@nestjs/common';

import { PuppeteerService } from './service.js';

@Module({
  providers: [PuppeteerService],
  exports: [PuppeteerService],
})
export class PuppeteerModule {}
