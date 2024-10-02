import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NewsService } from './service';
import { DemoResponse } from './type';

@Controller('news')
@ApiTags(NewsController.name)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('demo')
  async demo(): Promise<DemoResponse> {
    return await this.newsService.demo();
  }
}
