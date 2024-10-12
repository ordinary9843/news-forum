import { Module } from '@nestjs/common';

import { NewsCategoryController } from './controller.js';
import { NewsCategoryService } from './service.js';

@Module({
  controllers: [NewsCategoryController],
  providers: [NewsCategoryService],
  exports: [NewsCategoryService],
})
export class NewsCategoryModule {}
