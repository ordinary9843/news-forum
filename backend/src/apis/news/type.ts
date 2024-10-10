import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';

import { PaginatedNews } from './dto.js';

export type CreateNewsParams = {
  locale: Locale;
  category: Category;
  guid: string;
  link: string;
  title: string;
  description: string;
  source: string;
  publishedAt: Date;
};

export type UpdateNewsByGuidParams = {
  link?: string | null;
  description?: string | null;
};

export type GetNewsListResult = PaginatedNews;

export type DoesNewsExistResult = boolean;

export type CreateNewsResult = NewsEntity;

export type UpdateNewsByGuidResult = NewsEntity;
