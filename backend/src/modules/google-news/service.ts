import { inspect } from 'util';

import { extractFromHtml } from '@extractus/article-extractor';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { convert } from 'html-to-text';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { DataSource, IsNull, LessThan, Repository } from 'typeorm';
import { Parser } from 'xml2js';

import { NewsService } from '../../apis/news/service.js';
import { GoogleNewsEntity } from '../../entities/google-news/entity.js';
import { CATEGORY_MAPPING } from '../../entities/news/constant.js';
import { Category, Locale } from '../../entities/news/enum.js';
import { NewsVoteCountService } from '../news-vote-count/service.js';
import { PuppeteerService } from '../puppeteer/service.js';

import {
  GET_PENDING_RETRIEVAL_GOOGLE_NEWS_LIMIT,
  MAX_RETRIEVE_GOOGLE_NEWS_ATTEMPTS,
  RSS_URL,
} from './constant.js';
import { LocaleQuery } from './enum.js';
import {
  ExtractGoogleNewsItemResult,
  FeedItem,
  FetchGoogleNewsResult,
  IsValidGoogleNewsItemResult,
  ProcessGoogleNewsResult,
  ExtractNewsFromHtmlResult,
  GetPendingRetrievalGoogleNewsResult,
  UpdateGoogleNewsResult,
  CreateGoogleNewsResult,
  CreateGoogleNewsParams,
  UpdateGoogleNewsParams,
  ProcessNewsResult,
  FetchNewsResult,
  SanitizeDescriptionResult,
  TruncateBriefResult,
} from './type.js';

@Injectable()
export class GoogleNewsService {
  private readonly logger = new Logger(GoogleNewsService.name);

  constructor(
    @InjectRepository(GoogleNewsEntity)
    readonly googleNewsRepository: Repository<GoogleNewsEntity>,
    private readonly newsService: NewsService,
    private readonly newsVoteCountService: NewsVoteCountService,
    private readonly puppeteerService: PuppeteerService,
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    this.processGoogleNews();
    this.processNews();
  }

  async createGoogleNews(
    params: CreateGoogleNewsParams,
  ): Promise<CreateGoogleNewsResult> {
    return await this.googleNewsRepository.save(
      this.googleNewsRepository.create(params),
    );
  }

  async updateGoogleNews(
    id: number,
    params: UpdateGoogleNewsParams,
  ): Promise<UpdateGoogleNewsResult> {
    const existingGoogleNews = await this.googleNewsRepository.findOneBy({
      id,
    });
    if (!existingGoogleNews) {
      throw new NotFoundException('Google news not found');
    }

    Object.assign(existingGoogleNews, params);

    return await this.googleNewsRepository.save(existingGoogleNews);
  }

  @Cron('*/5 * * * *')
  async processGoogleNews(): Promise<ProcessGoogleNewsResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const categories = Object.values(Category);
    for (const category of categories) {
      for (const locale of Object.values(Locale)) {
        try {
          const rssFeed = await this.fetchGoogleNews(locale, category);
          for (const channel of rssFeed.rss.channel) {
            for (const item of channel.item) {
              await queryRunner.startTransaction();
              try {
                const googleNewsItem = this.extractGoogleNewsItem(item);
                const { guid, link, title, source, pubDate } = googleNewsItem;
                if (!this.isValidGoogleNewsItem(googleNewsItem)) {
                  this.logger.warn(
                    `processGoogleNews(): Skipping invalid news (title=${title})`,
                  );
                  continue;
                } else if (await this.newsService.doesNewsExistByGuid(guid)) {
                  this.logger.warn(
                    `processGoogleNews(): News already exists (title=${title})`,
                  );
                  continue;
                }
                await this.createGoogleNews({
                  guid,
                  link,
                });
                const { id } = await this.newsService.createNews({
                  locale,
                  category,
                  guid,
                  title,
                  source,
                  publishedAt: pubDate,
                });
                await this.newsVoteCountService.initializeVoteCounts(id);
                this.logger.log(
                  `processGoogleNews(): News has been saved successfully (title=${title})`,
                );
                await queryRunner.commitTransaction();
              } catch (error) {
                this.logger.error(
                  `processGoogleNews(): Failed to save news in transaction process (error=${inspect(
                    error,
                  )})`,
                );
                await queryRunner.rollbackTransaction();
              }
            }
          }
        } catch (error) {
          this.logger.error(
            `processGoogleNews(): Failed to fetch news (error=${inspect(error)})`,
          );
        }
      }
    }
    await queryRunner.release();
  }

  @Cron('*/3 * * * *')
  async processNews(): Promise<ProcessNewsResult> {
    const pendingRetrievalGoogleNews =
      await this.getPendingRetrievalGoogleNews();
    for (const googleNews of pendingRetrievalGoogleNews) {
      let page = null;
      const { id, guid, link, retrieveCount, news } = googleNews;
      const { title } = news;

      try {
        this.logger.verbose(
          `processNews(): Prepare retrieve news (title=${title})`,
        );

        const { browserPage, html, finalUrl, brief, description } =
          await this.fetchNews(link);
        page = browserPage;
        if (!finalUrl || !brief || !description) {
          throw new BadRequestException(`Failed to retrieve news`);
        }

        await this.newsService.updateNewsByGuid(guid, {
          link: finalUrl,
          brief,
          description,
          isCollected: true,
        });
        await this.updateGoogleNews(id, {
          link,
          html,
        });
        this.logger.log(
          `processNews(): News has been updated successfully (title=${title})`,
        );
      } catch (error) {
        this.logger.error(
          `processNews: Failed to retrieve news (error=${inspect(error)})`,
        );
        await this.updateGoogleNews(id, {
          retrieveCount: retrieveCount + 1,
        });
      } finally {
        await this.puppeteerService.closePage(page);
      }
    }
  }

  private async fetchGoogleNews(
    locale: Locale,
    category: Category,
  ): Promise<FetchGoogleNewsResult> {
    const url = `${RSS_URL}/topics/${CATEGORY_MAPPING[category]}?${LocaleQuery[locale]}`;
    const { data } = await axios.get(url);
    const parser = new Parser();

    return await parser.parseStringPromise(data);
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

  private async getPendingRetrievalGoogleNews(): Promise<GetPendingRetrievalGoogleNewsResult> {
    return await this.googleNewsRepository.find({
      relations: {
        news: true,
      },
      select: {
        news: {
          title: true,
        },
      },
      where: {
        html: IsNull(),
        retrieveCount: LessThan(MAX_RETRIEVE_GOOGLE_NEWS_ATTEMPTS),
      },
      take: GET_PENDING_RETRIEVAL_GOOGLE_NEWS_LIMIT,
    });
  }

  private async fetchNews(url: string): Promise<FetchNewsResult> {
    let page = null;

    try {
      page = await this.puppeteerService.openPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      const finalUrl = page.url();
      const html = await page.content();
      const { brief, description } = await this.extractNewsFromHtml(html);

      return {
        browserPage: page,
        html,
        finalUrl,
        brief,
        description,
      };
    } catch (error) {
      this.logger.error(
        `fetchNews: Failed to fetch news (error=${inspect(error)})`,
      );
    }

    return {
      browserPage: page,
      html: '',
      finalUrl: '',
      brief: '',
      description: '',
    };
  }

  private async extractNewsFromHtml(
    html: string,
  ): Promise<ExtractNewsFromHtmlResult> {
    try {
      const article = await extractFromHtml(html);
      if (!_.has(article, 'content')) {
        throw new BadRequestException('Failed to extract html');
      }

      const { content } = article;
      const description = this.sanitizeDescription(content);

      return {
        brief: this.truncateBrief(description),
        description,
      };
    } catch (error) {
      this.logger.error(
        `summarizeNewsFromHtml(): Failed to summarize article (error=${inspect(error)})`,
      );
    }

    return {
      brief: '',
      description: '',
    };
  }

  private sanitizeDescription(content: string): SanitizeDescriptionResult {
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
      preserveNewlines: true,
    };

    return _.trim(_.replace(convert(content, options), /\s+/g, ' '));
  }

  private truncateBrief(description: string): TruncateBriefResult {
    return _.truncate(description, {
      length: 150,
      omission: '...',
    });
  }
}
