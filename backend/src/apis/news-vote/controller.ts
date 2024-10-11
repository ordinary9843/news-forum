import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';

import { Request } from '../interface';

import { CastVoteResult } from '../news-vote/type.js';

import {
  CastVoteApiBadRequestResponse,
  CastVoteApiNotFoundResponse,
  CastVoteApiOkResponse,
  CastVoteApiTooManyRequestsResponse,
  CastVoteBody,
} from './dto.js';
import { NewsVoteService } from './service.js';

@Controller('news-vote')
@ApiTags('NewsVote')
export class NewsVoteController {
  constructor(private readonly newsVoteService: NewsVoteService) {}

  @ApiOkResponse({
    type: CastVoteApiOkResponse,
  })
  @ApiBadRequestResponse({
    type: CastVoteApiBadRequestResponse,
  })
  @ApiNotFoundResponse({
    type: CastVoteApiNotFoundResponse,
  })
  @ApiTooManyRequestsResponse({
    type: CastVoteApiTooManyRequestsResponse,
  })
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Post('/:newsId')
  async castVote(
    @Req() request: Request,
    @Param('newsId') newsId: number,
    @Body() body: CastVoteBody,
  ): Promise<CastVoteResult> {
    const { clientIp } = request;

    return await this.newsVoteService.castVote({
      ...body,
      newsId,
      votedIp: clientIp,
    });
  }
}
