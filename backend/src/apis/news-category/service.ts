import { Injectable } from '@nestjs/common';

import _ from 'lodash';

import { Category } from '../../entities/news/enum.js';

import { GetNewsCategoriesResult } from './type.js';

@Injectable()
export class NewsCategoryService {
  async getNewsCategories(): Promise<GetNewsCategoriesResult> {
    const categoryMapping = {
      [Category.BUSINESS]: '商業',
      [Category.ENTERTAINMENT]: '娛樂',
      [Category.SPOTS]: '體育',
      [Category.TECHNOLOGY]: '科技',
      [Category.FINANCE]: '財經',
      [Category.POLITICS]: '政治',
      [Category.HEALTH]: '健康',
      [Category.PET]: '寵物',
      [Category.GLOBAL]: '國際',
    };
    const categories = _.map(categoryMapping, (label, key) => {
      return {
        key,
        label,
      };
    });

    return {
      totalCategories: categories.length,
      categories,
    };
  }
}
