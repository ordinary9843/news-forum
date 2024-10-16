import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { Category, Locale } from '../../entities/news/enum.js';
import { ApiResponse } from '../interface.js';

import { VoteStatistics } from '../news-vote/dto.js';

import { GetNewsListResult } from './type.js';

export class Item {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: Locale.ZH_TW })
  locale: Locale;

  @ApiProperty({ example: Category.BUSINESS })
  category: Category;

  @ApiProperty({ example: 'https://money.udn.com/money/story/5612/8279404' })
  link: string;

  @ApiProperty({
    example:
      '鴻海蓋最大 AI 伺服器廠 規劃在墨西哥建GB200工廠 | 產業熱點 | 產業 - 經濟日報',
  })
  title: string;

  @ApiProperty({
    example:
      '鴻海（2317）董事長劉揚偉昨（8）日表示，繼主權AI之後，主權伺服器正在興起...',
  })
  description: string;

  @ApiProperty({ example: '經濟日報' })
  source: string;

  @ApiProperty({ example: '2024-10-10 09:36:48' })
  publishedAt: string;

  @ApiProperty({ example: false })
  isVoted: boolean;

  @ApiProperty({ type: VoteStatistics })
  voteStatistics: VoteStatistics;
}

export class PaginatedNews {
  @ApiProperty({ example: 1 })
  totalItems: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ type: [Item] })
  items: Item[];
}

export class GetNewsListQuery {
  @ApiProperty({ example: Category.BUSINESS })
  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  reset?: boolean;
}

export class GetNewsListApiOkResponse implements ApiResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: PaginatedNews })
  result: GetNewsListResult;
}

export class GetNewsListApiTooManyRequestsResponse implements ApiResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Too many requests' })
  message: string;
}
