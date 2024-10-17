import { Module } from '@nestjs/common';

import { SummarizeService } from './service.js';

@Module({
  providers: [SummarizeService],
  exports: [SummarizeService],
})
export class SummarizeModule {}
