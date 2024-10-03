import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Parser } from 'xml2js';

import { RSS_URL } from './constant';
import { Category, LocaleQuery } from './enum';
import { DemoResponse, RssFeed } from './type';

@Injectable()
export class NewsService {
  private readonly logger: Logger = new Logger(NewsService.name);

  async demo(): Promise<DemoResponse> {
    try {
      const url: string = `${RSS_URL}/topics/${Category.GLOBAL}?${LocaleQuery.ZH_TW}`;
      const response: AxiosResponse = await axios.get(url);
      const parser: Parser = new Parser();
      const rssFeed: RssFeed = await parser.parseStringPromise(response.data);

      return rssFeed.rss.channel;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
