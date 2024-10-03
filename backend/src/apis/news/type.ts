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

export type DemoResponse = FeedChannel[];
