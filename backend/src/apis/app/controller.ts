import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './service';

@Controller('app')
@ApiTags(AppController.name)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  async test(): Promise<any> {
    return await this.appService.test();
  }
}
