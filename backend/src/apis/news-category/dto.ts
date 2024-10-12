import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { Category } from '../../entities/news/enum.js';
import { ApiResponse } from '../interface.js';

import { GetNewsCategoriesResult } from './type.js';

export class CategoryOverview {
  @ApiProperty({ example: 9 })
  totalCategories: number;

  @ApiProperty({
    example: {
      [Category.BUSINESS]: '商業',
      [Category.ENTERTAINMENT]: '娛樂',
      [Category.SPOTS]: '體育',
      [Category.TECHNOLOGY]: '科技',
      [Category.FINANCE]: '財經',
      [Category.POLITICS]: '政治',
      [Category.HEALTH]: '健康',
      [Category.PET]: '寵物',
      [Category.GLOBAL]: '國際',
    },
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
