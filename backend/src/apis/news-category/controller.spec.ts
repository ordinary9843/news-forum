// npm run test -- ./src/apis/news-category/controller.spec.ts

import { Test } from '@nestjs/testing';

import { Category } from '../../entities/news/enum.js';

import { NewsCategoryController } from './controller.js';
import { NewsCategoryService } from './service.js';

const mockNewsCategories = {
  totalCategories: 9,
  categories: [
    { key: Category.BUSINESS, label: '商業' },
    { key: Category.ENTERTAINMENT, label: '娛樂' },
    { key: Category.SPOTS, label: '體育' },
    { key: Category.TECHNOLOGY, label: '科技' },
    { key: Category.FINANCE, label: '財經' },
    { key: Category.POLITICS, label: '政治' },
    { key: Category.HEALTH, label: '健康' },
    { key: Category.PET, label: '寵物' },
    { key: Category.GLOBAL, label: '國際' },
  ],
};

describe('NewsCategoryController', () => {
  let newsCategoryController: NewsCategoryController;
  let newsCategoryService: NewsCategoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NewsCategoryController],
      providers: [NewsCategoryService],
    }).compile();
    newsCategoryController = module.get<NewsCategoryController>(
      NewsCategoryController,
    );
    newsCategoryService = module.get<NewsCategoryService>(NewsCategoryService);
  });

  describe('getNewsCategories', () => {
    it('should return the result from the service', async () => {
      jest
        .spyOn(newsCategoryService, 'getNewsCategories')
        .mockResolvedValue(mockNewsCategories);
      expect(await newsCategoryController.getNewsCategories()).toBe(
        mockNewsCategories,
      );
      expect(newsCategoryService.getNewsCategories).toHaveBeenCalledTimes(1);
    });
  });
});
