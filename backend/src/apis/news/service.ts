import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { get, isEmpty, some } from 'lodash';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { Parser } from 'xml2js';

import { CATEGORY_MAPPING } from '../../entities/news/constant';
import { NewsEntity } from '../../entities/news/entity';
import { Category, Locale } from '../../entities/news/enum';

import { RSS_URL } from './constant';
import { LocaleQuery } from './enum';
import {
  DemoResponse,
  DoesNewsExistResult,
  ExtractNewsItemResult,
  FeedItem,
  FetchNewsResult,
  IsValidNewsItemResult,
  NewsItem,
  RssFeed,
  SaveNewsResult,
} from './type';

@Injectable()
export class NewsService {
  private readonly logger: Logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsEntity)
    readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async demo(): Promise<DemoResponse> {
    await this.saveNews();
  }

  @Cron('*/5 * * * *')
  async saveNews(): Promise<SaveNewsResult> {
    const categories: Category[] = Object.values(Category) as Category[];
    for (const category of categories) {
      for (const locale of Object.values(Locale)) {
        try {
          const rssFeed: RssFeed = await this.fetchNews(locale, category);
          for (const channel of rssFeed.rss.channel) {
            for (const item of channel.item) {
              const newsItem: NewsItem = this.extractNewsItem(item);
              const { guid, link, title, source, pubDate }: NewsItem = newsItem;
              if (!this.isValidNewsItem(newsItem)) {
                this.logger.warn(`Skipping invalid news "${title}"`);
                continue;
              } else if (await this.doesNewsExist(guid)) {
                this.logger.warn(`News "${title}" already exists`);
                continue;
              }

              await this.newsRepository.save(
                this.newsRepository.create({
                  locale,
                  category,
                  guid,
                  googleLink: link,
                  title,
                  source,
                  publishedAt: pubDate,
                }),
              );
              this.logger.log(`News "${title}" has been saved successfully`);
            }
          }
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }

  private async fetchNews(
    locale: Locale,
    category: Category,
  ): Promise<FetchNewsResult> {
    const url: string = `${RSS_URL}/topics/${CATEGORY_MAPPING[category]}?${LocaleQuery[locale]}`;
    const response: AxiosResponse = await axios.get(url);
    const parser: Parser = new Parser();

    return await parser.parseStringPromise(response.data);
  }

  async doesNewsExist(guid: string): Promise<DoesNewsExistResult> {
    return (
      (await this.newsRepository.count({
        where: { guid },
      })) > 0
    );
  }

  private extractNewsItem(feedItem: FeedItem): ExtractNewsItemResult {
    return {
      guid: get(feedItem, 'guid.0._'),
      link: get(feedItem, 'link.0'),
      title: get(feedItem, 'title.0'),
      description: get(feedItem, 'description.0'),
      source: get(feedItem, 'source.0._'),
      pubDate: DateTime.fromHTTP(get(feedItem, 'pubDate.0')).toJSDate(),
    };
  }

  private isValidNewsItem(
    newsItem: ExtractNewsItemResult,
  ): IsValidNewsItemResult {
    return !some(Object.values(newsItem), (value: string) => isEmpty(value));
  }
}
