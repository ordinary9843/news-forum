// npm run test -- ./src/apis/news-category/service.spec.ts

import { Test } from '@nestjs/testing';

import { Category } from '../../entities/news/enum.js';

import { NewsCategoryService } from './service.js';

const mockCategories = [
  { key: Category.BUSINESS, label: '商業' },
  { key: Category.ENTERTAINMENT, label: '娛樂' },
  { key: Category.SPOTS, label: '體育' },
  { key: Category.TECHNOLOGY, label: '科技' },
  { key: Category.FINANCE, label: '財經' },
  { key: Category.POLITICS, label: '政治' },
  { key: Category.HEALTH, label: '健康' },
  { key: Category.PET, label: '寵物' },
  { key: Category.GLOBAL, label: '國際' },
];

describe('NewsCategoryService', () => {
  let newsCategoryService: NewsCategoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NewsCategoryService],
    }).compile();
    newsCategoryService = module.get<NewsCategoryService>(NewsCategoryService);
  });

  it('should be defined', () => {
    expect(newsCategoryService).toBeDefined();
  });

  describe('getNewsCategories', () => {
    it('should return correct news categories', async () => {
      const { totalCategories, categories } =
        await newsCategoryService.getNewsCategories();
      expect(totalCategories).toBe(mockCategories.length);
      expect(categories).toEqual(mockCategories);
    });
  });
});
