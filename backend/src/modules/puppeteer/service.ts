import { ChildProcess } from 'child_process';
import { inspect } from 'util';

import { Injectable, Logger } from '@nestjs/common';
import { Mutex, MutexInterface } from 'async-mutex';
import Bluebird from 'bluebird';
import _ from 'lodash';
import { DateTime } from 'luxon';
import puppeteer, { Browser, Page } from 'puppeteer';

import {
  BROWSER_EXPIRED_MILLISECONDS,
  CLOSE_BROWSER_RETRY_COUNT,
  CLOSE_PAGE_RETRY_COUNT,
  MAX_BROWSER_INSTANCES,
  MAX_USAGE_PER_BROWSER,
} from './constant.js';
import {
  BrowserStatus,
  CloseAllBrowsersResult,
  CreateBrowserResult,
  DeleteExpiredBrowsersResult,
  GetBrowserResult,
  MarkBrowserExpiredResult,
  ShouldCreateBrowserResult,
  ShouldMarkBrowserExpiredResult,
  OpenBrowserPageResult,
  GetAvailableBrowserResult,
  CloseAllPagesResult,
  CloseBrowserResult,
  ClosePageResult,
} from './type.js';

@Injectable()
export class PuppeteerService {
  private readonly logger: Logger = new Logger(PuppeteerService.name);
  private readonly browsers: Map<Browser, BrowserStatus> = new Map<
    Browser,
    BrowserStatus
  >();
  private readonly mutex: Mutex;

  constructor() {
    this.mutex = new Mutex();
  }

  async onModuleDestroy() {
    await this.closeAllBrowsers();
  }

  async openBrowserPage(): Promise<OpenBrowserPageResult> {
    let browser: Browser;
    let page: Page;
    const release: MutexInterface.Releaser = await this.mutex.acquire();

    try {
      browser = await this.getBrowser();
      if (_.isEmpty(browser)) {
        throw new Error(
          'openBrowserPage(): There are currently no browser available',
        );
      }
      page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (
          request.resourceType() === 'document' ||
          request.resourceType() === 'xhr' ||
          request.resourceType() === 'script'
        ) {
          request.continue();
        } else {
          request.abort();
        }
      });
      await page.setExtraHTTPHeaders({
        'Sec-Ch-Ua':
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      });
    } catch (error) {
      this.logger.error(
        `openBrowserPage(): Current browser status (error=${inspect(error)})`,
      );

      throw error;
    } finally {
      release();
    }

    return {
      browser,
      page,
    };
  }

  async closeBrowser(
    browser: Browser,
    retryCount: number = CLOSE_BROWSER_RETRY_COUNT,
  ): Promise<CloseBrowserResult> {
    if (!browser) {
      this.logger.verbose(`closeBrowser(): Browser does not exist`);
      return;
    }

    await this.closeAllPages(browser);

    try {
      await browser.close();
      this.browsers.delete(browser);
      this.logger.log('closeBrowser(): Browser process killed successfully');
    } catch (error) {
      if (_.has(browser, 'process')) {
        const process: ChildProcess = browser.process();
        const killRes: boolean = process.kill('SIGKILL');
        if (killRes) {
          this.browsers.delete(browser);
          this.logger.log(
            `closeBrowser(): Killed pid ${process.pid} successfully`,
          );
        } else {
          this.logger.error(`closeBrowser(): Kill pid ${process.pid} failed`);
        }
      }

      if (retryCount > 0) {
        this.logger.error(
          `closeBrowser(): Retrying ... (retryCount=${
            CLOSE_BROWSER_RETRY_COUNT - retryCount + 1
          }, error=${inspect(error)})`,
        );
        await this.closeBrowser(browser, retryCount - 1);
      } else {
        this.logger.error(
          `closeBrowser(): Failed after multiple retries (error=${inspect(
            error,
          )})`,
        );
      }
    }
  }

  async closePage(
    page: Page,
    retryCount: number = CLOSE_PAGE_RETRY_COUNT,
  ): Promise<ClosePageResult> {
    if (!page) {
      this.logger.verbose(`closePage(): Page does not exist`);
      return;
    }

    try {
      page.off('request');
      await page.setRequestInterception(false);
      await page.close();
    } catch (error) {
      if (retryCount > 0) {
        this.logger.error(
          `closePage(): Retrying ... (retryCount=${
            CLOSE_PAGE_RETRY_COUNT - retryCount + 1
          }, error=${inspect(error)})`,
        );
        await this.closePage(page, retryCount - 1);
      } else {
        this.logger.error(
          `closePage(): Failed after multiple retries  (error=${inspect(
            error,
          )})`,
        );
      }
    }
  }

  private async getBrowser(): Promise<GetBrowserResult> {
    const browser: Browser = (await this.shouldCreateBrowser())
      ? await this.createBrowser()
      : await this.getAvailableBrowser();
    if (_.isEmpty(browser)) {
      return null;
    }

    const { usageCount }: BrowserStatus = this.browsers.get(browser);
    this.browsers.set(browser, {
      usageCount: usageCount + 1,
    });
    if (this.shouldMarkBrowserExpired(browser)) {
      this.markBrowserExpired(browser);
    }

    this.logger.verbose(
      `Browser status (pid=${browser.process().pid}, usageCount=${usageCount})`,
    );

    return browser;
  }

  private async getAvailableBrowser(): Promise<GetAvailableBrowserResult> {
    await this.deleteExpiredBrowsers();

    let availableBrowser: Browser;
    for (const [browser, { usageCount }] of this.browsers) {
      if (usageCount < MAX_USAGE_PER_BROWSER) {
        availableBrowser = browser;
        break;
      }
    }

    return availableBrowser;
  }

  private async createBrowser(): Promise<CreateBrowserResult> {
    const browser: Browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-notifications',
        '--disable-infobars',
      ],
      ...(process.env.BIN_PATH && { executablePath: process.env.BIN_PATH }),
    });
    this.browsers.set(browser, {
      usageCount: 0,
    });

    return browser;
  }

  private async shouldCreateBrowser(): Promise<ShouldCreateBrowserResult> {
    return this.browsers.size < MAX_BROWSER_INSTANCES;
  }

  private shouldMarkBrowserExpired(
    browser: Browser,
  ): ShouldMarkBrowserExpiredResult {
    if (this.browsers.has(browser)) {
      const { usageCount, expiredAt = 0 }: BrowserStatus =
        this.browsers.get(browser);
      if (usageCount >= MAX_USAGE_PER_BROWSER && expiredAt === 0) {
        return true;
      }
    }

    return false;
  }

  private markBrowserExpired(browser: Browser): MarkBrowserExpiredResult {
    const { usageCount }: BrowserStatus = this.browsers.get(browser);
    this.browsers.set(browser, {
      usageCount,
      expiredAt: DateTime.now().toMillis() + BROWSER_EXPIRED_MILLISECONDS,
    });
    this.logger.verbose(
      `markBrowserExpired(): Current browser status (usageCount=${usageCount})`,
    );
  }

  private async deleteExpiredBrowsers(): Promise<DeleteExpiredBrowsersResult> {
    const now: number = DateTime.now().toMillis();
    await Bluebird.each(
      this.browsers,
      async ([browser, { expiredAt = 0 }]: [Browser, BrowserStatus]) => {
        if (expiredAt > 0 && expiredAt <= now) {
          await this.closeBrowser(browser);
        }
      },
    );
  }

  private async closeAllBrowsers(): Promise<CloseAllBrowsersResult> {
    this.logger.verbose('closeAllBrowsers:() Prepare delete all browsers');
    while (this.browsers.size > 0) {
      await Bluebird.each(this.browsers.keys(), async (browser: Browser) => {
        await this.closeBrowser(browser);
      });
    }
    this.logger.log('closeAllBrowsers:() Deleted all browsers successfully');
  }

  private async closeAllPages(browser: Browser): Promise<CloseAllPagesResult> {
    try {
      const pages: Page[] = await browser.pages();
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
}
