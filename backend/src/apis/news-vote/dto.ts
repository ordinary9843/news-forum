import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Bias } from '../../entities/news-vote/enum.js';

import { ApiResponse } from '../interface.js';

import { CastVoteResult, VoteMetrics } from './type.js';

export class VoteStatistics {
  @ApiProperty({ example: { count: 5, percent: 9 } })
  fair: VoteMetrics;

  @ApiProperty({ example: { count: 10, percent: 19 } })
  slightlyBiased: VoteMetrics;

  @ApiProperty({ example: { count: 33, percent: 64 } })
  heavilyBiased: VoteMetrics;

  @ApiProperty({ example: { count: 4, percent: 8 } })
  undetermined: VoteMetrics;
}

export class CastVoteBody {
  @ApiProperty({
    example: Bias.FAIR,
  })
  @IsEnum(Bias)
  bias: Bias;

  @ApiProperty({
    example: '192.168.1.1',
    required: false,
    readOnly: true,
  })
  @IsString()
  @IsOptional()
  readonly votedIp?: string;
}

export class CastVoteApiOkResponse implements ApiResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: VoteStatistics })
  result: CastVoteResult;
}

export class CastVoteApiBadRequestResponse implements ApiResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Vote has already been cast for this news' })
  message: string;
}

export class CastVoteApiNotFoundResponse implements ApiResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'News does not exist' })
  message: string;
}

export class CastVoteApiTooManyRequestsResponse implements ApiResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Too many requests' })
  message: string;
}
