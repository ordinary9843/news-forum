import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { Category } from '../../entities/news/enum.js';
import { ApiResponse } from '../interface.js';

import { GetNewsCategoriesResult } from './type.js';

export class CategoryOverview {
  @ApiProperty({ example: 9 })
  totalCategories: number;

  @ApiProperty({
    example: [
      {
        key: Category.BUSINESS,
        label: '商業',
      },
      {
        key: Category.ENTERTAINMENT,
        label: '娛樂',
      },
      {
        key: Category.SPOTS,
        label: '體育',
      },
      {
        key: Category.TECHNOLOGY,
        label: '科技',
      },
      {
        key: Category.FINANCE,
        label: '財經',
      },
      {
        key: Category.POLITICS,
        label: '政治',
      },
      {
        key: Category.HEALTH,
        label: '健康',
      },
      {
        key: Category.PET,
        label: '寵物',
      },
      {
        key: Category.GLOBAL,
        label: '國際',
      },
    ],
  })
  categories: Record<string, string>;
}

export class GetNewsCategoriesApiOkResponse implements ApiResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: CategoryOverview })
  result: GetNewsCategoriesResult;
}

export class GetNewsCategoriesApiTooManyRequestsResponse
  implements ApiResponse
{
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Too many requests' })
  message: string;
}
