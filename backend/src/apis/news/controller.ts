import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { boolean } from 'boolean';

import { Request } from '../interface';

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
    @Req() request: Request,
    @Query() query: GetNewsListQuery,
  ): Promise<GetNewsListResult> {
    const { clientIp } = request;
    const { reset, ...restQuery } = query;

    return await this.newsService.getNewsList({
      ...restQuery,
      reset: boolean(reset),
      clientIp,
    });
  }
}
