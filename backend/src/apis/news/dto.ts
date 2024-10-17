import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { boolean } from 'boolean';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';

import { Category, Locale } from '../../entities/news/enum.js';
import { Bias } from '../../entities/news-vote/enum.js';
import { ApiResponse } from '../interface.js';

import { VoteStatistics } from '../news-vote/dto.js';

import { GET_NEWS_LIST_LIMIT } from './constant.js';
import { GetNewsListResult } from './type.js';

export class Item {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: Locale.ZH_TW })
  locale: Locale;

  @ApiProperty({ example: Category.BUSINESS })
  category: Category;

  @ApiProperty({ example: 'https://pr.tsmc.com/chinese/news/3180' })
  link: string;

  @ApiProperty({
    example:
      '台積公司2024年第三季每股盈餘新台幣12.54元|台灣積體電路製造股份有限公司 - TSMC Events',
  })
  title: string;

  @ApiProperty({
    example:
      '發佈單位 :台灣積體電路製造股份有限公司 發佈日期 : 2024/10/17 台灣積體電路製造股份有限公司今（17）日公佈2024年第三季財務報告，合併營收約新台幣7,596億9千萬元，稅後純益約新台幣3,252億6千萬元，每股盈餘為新台幣12.54元（折合美國存託憑證每單位為1.94美元）。...',
  })
  brief: string;

  @ApiProperty({
    example:
      '發佈單位 :台灣積體電路製造股份有限公司 發佈日期 : 2024/10/17 台灣積體電路製造股份有限公司今（17）日公佈2024年第三季財務報告，合併營收約新台幣7,596億9千萬元，稅後純益約新台幣3,252億6千萬元，每股盈餘為新台幣12.54元（折合美國存託憑證每單位為1.94美元）。 與去年同期相較，2024年第三季營收增加了39.0%，稅後純益與每股盈餘皆增加了54.2%。與前一季相較，2024年第三季營收增加了12.8%，稅後純益則增加了31.2%。以上財務數字皆為合併財務報表數字，且係依照金管會認可之國際財務報導準則（TIFRS）所編製。 若以美元計算，2024年第三季營收為235億，較去年同期增加了36.0%，較前一季增加了12.9%。 2024年第三季毛利率為57.8%，營業利益率為47.5%，稅後純益率則為42.8%。 3奈米製程出貨佔台積公司2024年第三季晶圓銷售金額的20%，5奈米製程出貨佔全季晶圓銷售金額的32%；7奈米製程出貨則佔全季晶圓銷售金額的17%。總體而言，先進製程（包含7奈米及更先進製程）的營收達到全季晶圓銷售金額的69%。',
  })
  description: string;

  @ApiProperty({ example: 'TSMC Events' })
  source: string;

  @ApiProperty({ example: '2024-10-17 13:34:34' })
  publishedAt: string;

  @ApiProperty({ example: true })
  isVoted: boolean;

  @ApiProperty({ example: Bias.FAIR })
  votedOption: Bias;

  @ApiProperty({ type: VoteStatistics })
  voteStatistics: VoteStatistics;
}

export class PaginatedNews {
  @ApiProperty({
    example:
      'VGh1IE9jdCAxNyAyMDI0IDA4OjAzOjEyIEdNVCswODAwICjlj7DljJfmqJnmupbmmYLplpMp',
  })
  nextToken: string;

  @ApiProperty({
    example: true,
  })
  hasItems: boolean;

  @ApiProperty({ type: [Item] })
  items: Item[];
}

export class GetNewsListQuery {
  @ApiPropertyOptional({ example: false })
  @Transform(({ value }) => boolean(value))
  @IsOptional()
  reset?: string;

  @ApiPropertyOptional({
    example:
      'VGh1IE9jdCAxNyAyMDI0IDA4OjAzOjEyIEdNVCswODAwICjlj7DljJfmqJnmupbmmYLplpMp',
  })
  @IsString()
  @IsOptional()
  nextToken?: string;

  @ApiPropertyOptional({ example: GET_NEWS_LIST_LIMIT })
  @Min(10)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: Category.BUSINESS })
  @IsEnum(Category)
  @IsOptional()
  category?: Category;
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
