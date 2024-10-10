import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { GetNewsListApiOkResponse, GetNewsListQuery } from './dto.js';
import { NewsService } from './service.js';
import { GetNewsListResult } from './type.js';

@Controller('news')
@ApiTags(NewsController.name)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOkResponse({
    type: GetNewsListApiOkResponse,
  })
  @Get('/')
  async getItems(@Query() query: GetNewsListQuery): Promise<GetNewsListResult> {
    return await this.newsService.getNewsList(query);
  }
}
