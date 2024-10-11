import { ApiProperty } from '@nestjs/swagger';

import { NewsVoteCount } from './type.js';

export class NewsVoteCounts {
  @ApiProperty({ example: { count: 5, percent: 9 } })
  fair: NewsVoteCount;

  @ApiProperty({ example: { count: 10, percent: 19 } })
  slightlyBiased: NewsVoteCount;

  @ApiProperty({ example: { count: 33, percent: 64 } })
  heavilyBiased: NewsVoteCount;

  @ApiProperty({ example: { count: 4, percent: 8 } })
  undetermined: NewsVoteCount;
}
