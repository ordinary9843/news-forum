import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

import { Category, Locale } from '../../entities/news/enum.js';
import { ApiResponse } from '../interface.js';

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
}

export class PaginatedNews {
  @ApiProperty({ example: 1 })
  totalItems: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  pageItems: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ type: [Item] })
  items: Item[];
}

export class GetNewsListQuery {
  [key: string]: unknown;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  page: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(10)
  @Max(50)
  @IsOptional()
  limit?: number;
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
