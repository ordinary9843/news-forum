import { Global, Module } from '@nestjs/common';

import { JsonService } from './service.js';

@Global()
@Module({
  providers: [JsonService],
  exports: [JsonService],
})
export class JsonModule {}
