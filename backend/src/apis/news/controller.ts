import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NewsService } from './service.js';

@Controller('news')
@ApiTags(NewsController.name)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('demo')
  async demo() {
    // return await this.newsService.demo();
    return 'Demo';
  }
}
