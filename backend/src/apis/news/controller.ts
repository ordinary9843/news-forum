import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';

import { NewsVoteService } from '../../modules/news-vote/service.js';

import { CastVoteResult } from '../../modules/news-vote/type.js';

import { Request } from '../interface';

import {
  CastVoteApiBadRequestResponse,
  CastVoteApiOkResponse,
  CastVoteApiTooManyRequestsResponse,
  CastVoteBody,
  GetNewsListApiOkResponse,
  GetNewsListApiTooManyRequestsResponse,
  GetNewsListQuery,
} from './dto.js';
import { NewsService } from './service.js';
import { GetNewsListResult } from './type.js';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsVoteService: NewsVoteService,
  ) {}

  @ApiOkResponse({
    type: GetNewsListApiOkResponse,
  })
  @ApiTooManyRequestsResponse({
    type: GetNewsListApiTooManyRequestsResponse,
  })
  @Get('/')
  async getItems(@Query() query: GetNewsListQuery): Promise<GetNewsListResult> {
    return await this.newsService.getNewsList(query);
  }

  @ApiOkResponse({
    type: CastVoteApiOkResponse,
  })
  @ApiBadRequestResponse({
    type: CastVoteApiBadRequestResponse,
  })
  @ApiTooManyRequestsResponse({
    type: CastVoteApiTooManyRequestsResponse,
  })
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Patch('/:id/vote')
  async castVote(
    @Req() request: Request,
    @Param('id') id: number,
    @Body() body: CastVoteBody,
  ): Promise<CastVoteResult> {
    const { clientIp } = request;

    return await this.newsVoteService.castVote({
      ...body,
      newsId: id,
      votedIp: clientIp,
    });
  }
}
