import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';

import { PaginatedNews } from './dto.js';

export type GetNewsListParams = {
  clientIp: string;
  reset?: boolean;
  category?: Category;
};

export type CreateNewsParams = {
  locale: Locale;
  category: Category;
  guid: string;
  title: string;
  source: string;
  publishedAt: Date;
};

export type UpdateNewsByGuidParams = {
  link?: string | null;
  brief?: string | null;
  description?: string | null;
};

export type GetLastQueryParams = {
  reset?: boolean;
  category?: Category;
};

export type UpdateLastQueryParams = {
  lastPage: number;
  items: NewsEntity[];
  category?: Category;
};

export type GetTotalItemsOptions = {
  category?: Category;
};

export type TransformNewsListParams = {
  totalItems: number;
  totalPages: number;
  lastPage: number;
  items: NewsEntity[];
};

export type GetNewsListResult = PaginatedNews;

export type DoesNewsExistResult = boolean;

export type DoesNewsExistByGuidResult = boolean;

export type CreateNewsResult = NewsEntity;

export type UpdateNewsByGuidResult = NewsEntity;

export type GenerateNewsListCacheKeyResult = string;

export type GetLastQueryResult = {
  lastPage: number;
  lastPublishedAt: Date;
};

export type UpdateLastQueryResult = void;

export type GetTotalItemsResult = number;

export type TransformNewsListResult = PaginatedNews;
