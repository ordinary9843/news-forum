import { Global, Module } from '@nestjs/common';

import { DateService } from './service';

@Global()
@Module({
  providers: [DateService],
  exports: [DateService],
})
export class DateModule {}
