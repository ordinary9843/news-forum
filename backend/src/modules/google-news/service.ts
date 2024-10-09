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
  SaveGoogleNewsResult,
  SummarizeArticleResult,
  GetPendingRetrievalGoogleNewsResult,
  UpdateGoogleNewsResult,
  CreateGoogleNewsResult,
  CreateGoogleNewsParams,
  UpdateGoogleNewsParams,
  SaveArticlesResult,
} from './type.js';

@Injectable()
export class GoogleNewsService {
  private readonly logger = new Logger(GoogleNewsService.name);

  constructor(
    @InjectRepository(GoogleNewsEntity)
    readonly googleNewsRepository: Repository<GoogleNewsEntity>,
    private readonly newsService: NewsService,
    private readonly puppeteerService: PuppeteerService,
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    // await this.saveGoogleNews();
    await this.saveArticles();
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
      throw new NotFoundException(`Google news with id ${id} not found`);
    }

    Object.assign(existingGoogleNews, params);

    return await this.googleNewsRepository.save(existingGoogleNews);
  }

  @Cron('*/5 * * * *')
  async saveGoogleNews(): Promise<SaveGoogleNewsResult> {
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
                    `saveGoogleNews(): Skipping invalid news "${title}"`,
                  );
                  continue;
                } else if (await this.newsService.doesNewsExist(guid)) {
                  this.logger.warn(
                    `saveGoogleNews(): News "${title}" already exists`,
                  );
                  continue;
                }
                await this.createGoogleNews({
                  guid,
                  link,
                });
                await this.newsService.createNews({
                  locale,
                  category,
                  guid,
                  link: null,
                  title,
                  description: null,
                  source,
                  publishedAt: pubDate,
                });
                this.logger.log(
                  `saveGoogleNews(): News "${title}" has been saved successfully`,
                );
                await queryRunner.commitTransaction();
              } catch (error) {
                this.logger.error(
                  `saveGoogleNews(): Failed to save google news & news in transaction (error=${inspect(
                    error,
                  )})`,
                );
                await queryRunner.rollbackTransaction();
              }
            }
          }
        } catch (error) {
          this.logger.error(
            `saveGoogleNews(): Failed to fetch google news (error=${inspect(error)})`,
          );
        }
      }
    }
    await queryRunner.release();
  }

  @Cron('*/3 * * * *')
  async saveArticles(): Promise<SaveArticlesResult> {
    const pendingRetrievalGoogleNews =
      await this.getPendingRetrievalGoogleNews();
    for (const googleNews of pendingRetrievalGoogleNews) {
      let page = null;
      let id = null;
      try {
        const { id: googleNewsId, guid, link } = googleNews;
        this.logger.verbose(
          `retrieveAndProcessArticle(): Prepare retrieve article "${link}"`,
        );

        page = await this.puppeteerService.openPage();
        id = googleNewsId;
        await page.goto(link, { waitUntil: 'networkidle2' });
        const finalUrl = page.url();
        const html = await page.content();
        const summary = await this.summarizeArticle(html);
        if (!finalUrl || !summary) {
          throw new BadRequestException(`Failed to retrieve article`);
        }

        await this.newsService.updateNewsByGuid(guid, {
          link: finalUrl,
          description: summary,
        });
        await this.updateGoogleNews(id, {
          link,
          html,
        });
        this.logger.log(
          `retrieveAndProcessArticle(): News "${link}" has been updated successfully`,
        );
      } catch (error) {
        this.logger.error(
          `retrieveAndProcessArticle: Failed to retrieve article (error=${inspect(error)})`,
        );
        await this.updateGoogleNews(id, {
          retrieveCount: googleNews.retrieveCount + 1,
        });
      } finally {
        if (page) {
          await this.puppeteerService.closePage(page).catch((error) => {
            this.logger.error(
              `retrieveAndProcessArticle: Failed to close page (error=${inspect(error)})`,
            );
          });
        }
      }
    }
  }

  private async fetchGoogleNews(
    locale: Locale,
    category: Category,
  ): Promise<FetchGoogleNewsResult> {
    const url = `${RSS_URL}/topics/${CATEGORY_MAPPING[category]}?${LocaleQuery[locale]}`;
    const response = await axios.get(url);
    const parser = new Parser();

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

  private async getPendingRetrievalGoogleNews(): Promise<GetPendingRetrievalGoogleNewsResult> {
    return await this.googleNewsRepository.find({
      where: {
        html: IsNull(),
        retrieveCount: LessThan(MAX_RETRIEVE_GOOGLE_NEWS_ATTEMPTS),
      },
      take: GET_PENDING_RETRIEVAL_GOOGLE_NEWS_LIMIT,
    });
  }

  private async summarizeArticle(
    html: string,
  ): Promise<SummarizeArticleResult> {
    try {
      const article = await extractFromHtml(html);
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
    } catch (error) {
      this.logger.error(
        `summarizeArticle: Failed to summarize article (error=${inspect(error)})`,
      );

      return '';
    }
  }
}
