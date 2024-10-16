import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from '../interface';

import { CastVoteResult } from '../news-vote/type.js';

import {
  CastVoteApiBadRequestResponse,
  CastVoteApiNotFoundResponse,
  CastVoteApiOkResponse,
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
