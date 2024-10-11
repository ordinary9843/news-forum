import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import {
  GetNewsListApiOkResponse,
  GetNewsListApiTooManyRequestsResponse,
  GetNewsListQuery,
} from './dto.js';
import { NewsService } from './service.js';
import { GetNewsListResult } from './type.js';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOkResponse({
    type: GetNewsListApiOkResponse,
  })
  @ApiTooManyRequestsResponse({
    type: GetNewsListApiTooManyRequestsResponse,
  })
  @Get('/')
  async getNewsList(
    @Query() query: GetNewsListQuery,
  ): Promise<GetNewsListResult> {
    return await this.newsService.getNewsList(query);
  }
}
