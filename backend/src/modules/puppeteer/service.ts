import { inspect } from 'util';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mutex } from 'async-mutex';
import Bluebird from 'bluebird';
import puppeteer, { Browser, Page } from 'puppeteer';

import {
  CreateBrowserResult,
  GetBrowserResult,
  OpenPageResult,
  CloseAllPagesResult,
  CloseBrowserResult,
  ClosePageResult,
} from './type.js';

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name);
  private readonly mutex: Mutex;
  private browser: Browser;
  private binPath: string;

  constructor(private readonly configService: ConfigService) {
    this.mutex = new Mutex();
    this.binPath = this.configService.get<string>('PUPPETEER.BIN_PATH');
  }

  async onModuleDestroy() {
    await this.closeBrowser(this.browser);
  }

  async getBrowser(): Promise<GetBrowserResult> {
    if (!this.browser) {
      this.browser = await this.createBrowser();
    }

    return this.browser;
  }

  async openPage(): Promise<OpenPageResult> {
    const release = await this.mutex.acquire();

    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.setExtraHTTPHeaders({
        'Sec-Ch-Ua':
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      });

      return page;
    } catch (error) {
      this.logger.error(
        `openPage(): Failed to open page (error=${inspect(error)})`,
      );
      throw error;
    } finally {
      release();
    }
  }

  async closePage(page: Page): Promise<ClosePageResult> {
    if (!page) {
      this.logger.verbose(`closePage(): Page does not exist`);
      return;
    }

    await page.close();
    this.logger.log('closePage(): Page closed successfully');
  }

  async closeBrowser(browser: Browser): Promise<CloseBrowserResult> {
    if (!browser) {
      this.logger.verbose(`closeBrowser(): Browser does not exist`);
      return;
    }

    await this.closeAllPages(browser);
    await browser.close();
    this.logger.log('closeBrowser(): Browser closed successfully');
  }

  async closeAllPages(browser: Browser): Promise<CloseAllPagesResult> {
    try {
      const pages = await browser.pages();
      await Bluebird.map(
        pages,
        async (page: Page) => await this.closePage(page),
      );
      this.logger.log('closeAllPages(): All page closed successfully');
    } catch (error) {
      this.logger.error(
        `closeAllPages(): Failed after multiple retries (error=${inspect(
          error,
        )})`,
      );
    }
  }

  private async createBrowser(): Promise<CreateBrowserResult> {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-notifications',
        '--disable-infobars',
      ],
      ...(this.binPath && { executablePath: this.binPath }),
    });
  }
}
