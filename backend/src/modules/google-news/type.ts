import { GoogleNewsEntity } from '../../entities/google-news/entity.js';

export type FeedGuid = {
  _: string;
  $: {
    isPermaLink: string;
  };
};

export type FeedSource = {
  _: string;
  $: {
    url: string;
  };
};

export type FeedItem = {
  title: string[];
  link: string[];
  guid: FeedGuid[];
  pubDate: string[];
  description: string[];
  source: FeedSource[];
};

export type FeedChannel = {
  title: string[];
  description: string[];
  item: FeedItem[];
};

export type RssFeed = {
  rss: {
    channel: FeedChannel[];
  };
};

export type GoogleNewsItem = {
  guid: string;
  link: string;
  title: string;
  description: string;
  source: string;
  pubDate: Date;
};

export type CreateGoogleNewsParams = {
  guid: string;
  link: string;
};

export type UpdateGoogleNewsParams = {
  link?: string | null;
  html?: string | null;
  retrieveCount?: number;
};

export type CreateGoogleNewsResult = GoogleNewsEntity;

export type UpdateGoogleNewsResult = GoogleNewsEntity;

export type SaveGoogleNewsResult = void;

export type RetrieveAndProcessArticlesResult = void;

export type FetchGoogleNewsResult = RssFeed;

export type DoesNewsExistResult = boolean;

export type ExtractGoogleNewsItemResult = GoogleNewsItem;

export type IsValidGoogleNewsItemResult = boolean;

export type GetPendingRetrievalGoogleNewsResult = GoogleNewsEntity[];

export type SummarizeArticleResult = string;
