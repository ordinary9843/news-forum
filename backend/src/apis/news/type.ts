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

export type NewsItem = {
  guid: string;
  link: string;
  title: string;
  description: string;
  source: string;
  pubDate: Date;
};

export type DemoResponse = void;

export type SaveNewsResult = void;

export type FetchNewsResult = RssFeed;

export type DoesNewsExistResult = boolean;

export type ExtractNewsItemResult = NewsItem;

export type IsValidNewsItemResult = boolean;
