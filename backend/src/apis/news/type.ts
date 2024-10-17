import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';

import { PaginatedNews } from './dto.js';

export type GetNewsListParams = {
  clientIp: string;
  reset?: boolean;
  nextToken?: string;
  limit?: number;
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
  isCollected: boolean;
};

export type ShouldResetQueryParams = {
  reset?: boolean;
  limit?: number;
  category?: Category;
};

export type UpdateLastQueryParams = {
  limit?: number;
  category?: Category;
};

export type TransformNewsListParams = {
  nextToken: string;
  items: NewsEntity[];
};

export type GetNewsListResult = PaginatedNews;

export type DoesNewsExistResult = boolean;

export type DoesNewsExistByGuidResult = boolean;

export type CreateNewsResult = NewsEntity;

export type UpdateNewsByGuidResult = NewsEntity;

export type EncodeNextTokenResult = string | undefined;

export type DecodeNextTokenResult = string | undefined;

export type GenerateLastQueryCacheKeyResult = string;

export type ShouldResetQueryResult = boolean;

export type UpdateLastQueryResult = void;

export type TransformNewsListResult = PaginatedNews;
