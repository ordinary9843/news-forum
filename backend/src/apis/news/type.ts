import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';

export type NewsItem = {
  locale: Locale;
  category: Category;
  guid: string;
  link: string;
  title: string;
  description: string | null;
  source: string;
  publishedAt: Date;
};

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

export type CreateNewsResult = NewsEntity;

export type UpdateNewsByGuidResult = NewsEntity;

export type DoesNewsExistResult = boolean;
