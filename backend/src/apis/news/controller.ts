import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { NewsVoteService } from '../../modules/news-vote/service.js';

import { CastVoteResult } from '../../modules/news-vote/type.js';

import { Request } from '../interface';

import {
  CastVoteApiOkResponse,
  CastVoteBody,
  GetNewsListApiOkResponse,
  GetNewsListQuery,
} from './dto.js';
import { NewsService } from './service.js';
import { GetNewsListResult } from './type.js';

@Controller('news')
@ApiTags(NewsController.name)
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsVoteService: NewsVoteService,
  ) {}

  @ApiOkResponse({
    type: GetNewsListApiOkResponse,
  })
  @Get('/')
  async getItems(@Query() query: GetNewsListQuery): Promise<GetNewsListResult> {
    return await this.newsService.getNewsList(query);
  }

  @ApiOkResponse({
    type: CastVoteApiOkResponse,
  })
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
