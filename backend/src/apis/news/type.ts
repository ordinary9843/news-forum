export type FeedItem = {
  title: string[];
  link: string[];
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
