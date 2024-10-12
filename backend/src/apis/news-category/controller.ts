import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import {
  GetNewsCategoriesApiOkResponse,
  GetNewsCategoriesApiTooManyRequestsResponse,
} from './dto.js';
import { NewsCategoryService } from './service.js';
import { GetNewsCategoriesResult } from './type.js';

@Controller('news-category')
@ApiTags('NewsCategory')
export class NewsCategoryController {
  constructor(private readonly newsCategoryService: NewsCategoryService) {}

  @ApiOkResponse({
    type: GetNewsCategoriesApiOkResponse,
  })
  @ApiTooManyRequestsResponse({
    type: GetNewsCategoriesApiTooManyRequestsResponse,
  })
  @Get('/')
  async getNewsCategories(): Promise<GetNewsCategoriesResult> {
    return await this.newsCategoryService.getNewsCategories();
  }
}
