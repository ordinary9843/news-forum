import * as fs from 'fs/promises';

import { inspect } from 'util';

import { ArticleData, extractFromHtml } from '@extractus/article-extractor';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { convert } from 'html-to-text';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { Page } from 'puppeteer';
import { Repository } from 'typeorm';
import { Parser } from 'xml2js';

import { GoogleNewsEntity } from '../../entities/google-news/entity.js';
import { CATEGORY_MAPPING } from '../../entities/news/constant.js';
import { NewsEntity } from '../../entities/news/entity.js';
import { Category, Locale } from '../../entities/news/enum.js';
import { PuppeteerService } from '../../modules/puppeteer/service.js';

import { RSS_URL } from './constant.js';
import { LocaleQuery } from './enum.js';
import {
  DemoResponse,
  DoesNewsExistResult,
  ExtractGoogleNewsItemResult,
  FeedItem,
  FetchGoogleNewsResult,
  IsValidGoogleNewsItemResult,
  GoogleNewsItem,
  RssFeed,
  SaveGoogleNewsResult,
  SummarizeArticleResult,
} from './type.js';

@Injectable()
export class NewsService {
  private readonly logger: Logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(GoogleNewsEntity)
    readonly googleNewsRepository: Repository<GoogleNewsEntity>,
    @InjectRepository(NewsEntity)
    readonly newsRepository: Repository<NewsEntity>,
    private readonly puppeteerService: PuppeteerService,
  ) {}

  async demo(): Promise<DemoResponse> {
    try {
      // const url: string =
      //   'https://news.google.com/rss/articles/CBMiX0FVX3lxTE9BS3ZLSUd5R3BRT25XZkJ2ZGphZWdBbEtiY3lHd1ZubVpnRkNGZG40RHE1YnJDcWtuckJMZS1pNktMNGszNEl3TlRkbkNtaGk2MkFIVUs4SjF1VWoyd1RN?oc=5';
      // const {
      //   page,
      // }: {
      //   page: Page;
      // } = await this.puppeteerService.openBrowserPage();
      // this.logger.verbose(
      //   `getCapturedRequest(): Prepare request post data (threadsUrl=${url}})`,
      // );
      // await page.goto(url, { waitUntil: 'networkidle0' });
      // const finalUrl: string = page.url();
      // const htmlContent: string = await page.content();
      const filePath: string = 'output.html';
      const fileData: string = await fs.readFile(filePath, 'utf-8');
      const summary: string = await this.summarizeArticle(fileData);
      console.log(summary);
      // await this.puppeteerService.closePage(page);
    } catch (error) {
      this.logger.error(
        `getCapturedRequest(): Capture request failed (error=${inspect(
          error,
        )})`,
      );
    }
    // await this.saveGoogleNews();
  }

  @Cron('*/5 * * * *')
  async saveGoogleNews(): Promise<SaveGoogleNewsResult> {
    const categories: Category[] = Object.values(Category) as Category[];
    for (const category of categories) {
      for (const locale of Object.values(Locale)) {
        try {
          const rssFeed: RssFeed = await this.fetchGoogleNews(locale, category);
          for (const channel of rssFeed.rss.channel) {
            for (const item of channel.item) {
              const googleNewsItem: GoogleNewsItem =
                this.extractGoogleNewsItem(item);
              const { guid, link, title, source, pubDate }: GoogleNewsItem =
                googleNewsItem;
              if (!this.isValidGoogleNewsItem(googleNewsItem)) {
                this.logger.warn(
                  `saveGoogleNews(): Skipping invalid news "${title}"`,
                );
                continue;
              } else if (await this.doesNewsExist(guid)) {
                this.logger.warn(
                  `saveGoogleNews(): News "${title}" already exists`,
                );
                continue;
              }
              await this.googleNewsRepository.save(
                this.googleNewsRepository.create({
                  guid,
                }),
              );
              await this.newsRepository.save(
                this.newsRepository.create({
                  locale,
                  category,
                  guid,
                  link,
                  title,
                  source,
                  publishedAt: pubDate,
                }),
              );
              this.logger.log(
                `saveGoogleNews(): News "${title}" has been saved successfully`,
              );
            }
          }
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }

  async doesNewsExist(guid: string): Promise<DoesNewsExistResult> {
    return (
      (await this.newsRepository.count({
        where: { guid },
      })) > 0
    );
  }

  private async fetchGoogleNews(
    locale: Locale,
    category: Category,
  ): Promise<FetchGoogleNewsResult> {
    const url: string = `${RSS_URL}/topics/${CATEGORY_MAPPING[category]}?${LocaleQuery[locale]}`;
    const response: AxiosResponse = await axios.get(url);
    const parser: Parser = new Parser();

    return await parser.parseStringPromise(response.data);
  }

  private extractGoogleNewsItem(
    feedItem: FeedItem,
  ): ExtractGoogleNewsItemResult {
    return {
      guid: _.get(feedItem, 'guid.0._'),
      link: _.get(feedItem, 'link.0'),
      title: _.get(feedItem, 'title.0'),
      description: _.get(feedItem, 'description.0'),
      source: _.get(feedItem, 'source.0._'),
      pubDate: DateTime.fromHTTP(_.get(feedItem, 'pubDate.0')).toJSDate(),
    };
  }

  private isValidGoogleNewsItem(
    googleNewsItem: ExtractGoogleNewsItemResult,
  ): IsValidGoogleNewsItemResult {
    return _.every(
      Object.values(googleNewsItem),
      (value: string) => !_.isNil(value),
    );
  }

  private async summarizeArticle(
    html: string,
  ): Promise<SummarizeArticleResult> {
    const article: ArticleData = await extractFromHtml(html);
    const options = {
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'h1', options: { uppercase: false } },
        { selector: 'h2', options: { uppercase: false } },
        { selector: 'h3', options: { uppercase: false } },
        { selector: 'h4', options: { uppercase: false } },
        { selector: 'h5', options: { uppercase: false } },
        { selector: 'h6', options: { uppercase: false } },
      ],
      wordwrap: false,
      preserveNewlines: true,
    };

    return _.trim(_.replace(convert(article.content, options), /\s+/g, ' '));
  }
}
