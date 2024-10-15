import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';

import { PuppeteerService } from './service.js';

jest.mock('puppeteer');

const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
const mockConfigService = {
  get: jest.fn().mockReturnValue('/path/to/chrome'),
} as Pick<ConfigService, 'get'>;
const mockPage = {
  setExtraHTTPHeaders: jest.fn(),
  close: jest.fn(),
} as Pick<Page, 'setExtraHTTPHeaders' | 'close'>;
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
  pages: jest.fn().mockResolvedValue([mockPage]),
  process: jest.fn().mockReturnValue({
    pid: 1234,
    kill: jest.fn().mockReturnValue(true),
  }),
} as Pick<Browser, 'newPage' | 'close' | 'pages' | 'process'>;

describe('PuppeteerService', () => {
  let puppeteerService: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuppeteerService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    puppeteerService = module.get<PuppeteerService>(PuppeteerService);
    mockedPuppeteer.launch.mockResolvedValue(mockBrowser as Browser);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('openPage', () => {
    it('should open a new page', async () => {
      const page = await puppeteerService.openPage();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(page).toBe(mockPage);
    });

    it('should log an error if opening a page fails', async () => {
      const errorMessage = 'Failed to open page';
      (mockBrowser.newPage as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      );
      await expect(puppeteerService.openPage()).rejects.toThrow(
        new Error(errorMessage),
      );
    });
  });

  describe('closePage', () => {
    it('should close the page', async () => {
      await puppeteerService.closePage(mockPage as Page);
      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should retry closing the page if it fails', async () => {
      (mockPage.close as jest.Mock).mockRejectedValueOnce(
        new Error('Close page error'),
      );
      await puppeteerService.closePage(mockPage as Page);
      expect(mockPage.close).toHaveBeenCalledTimes(2);
    });

    // it('should throw an error if closing the page fails after retries', async () => {
    //   (mockPage.close as jest.Mock).mockRejectedValue(
    //     new Error('Close page error'),
    //   );
    //   await expect(
    //     puppeteerService.closePage(mockPage as Page),
    //   ).rejects.toThrow('Close page error');
    // });
  });

  describe('createBrowser', () => {
    it('should create a new browser instance', async () => {
      const browser = await (puppeteerService as any).createBrowser();
      expect(mockedPuppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-extensions',
          '--disable-notifications',
          '--disable-infobars',
        ],
      });
      expect(browser).toBe(mockBrowser);
    });
  });

  describe('closeAllPages', () => {
    it('should close all pages', async () => {
      (mockBrowser.pages as jest.Mock).mockResolvedValue([mockPage]);
      await puppeteerService.closeAllPages(mockBrowser as Browser);
      expect(mockPage.close).toHaveBeenCalledTimes(1);
    });

    it('should not throw if there are no pages', async () => {
      (mockBrowser.pages as jest.Mock).mockResolvedValue([]);
      await expect(
        puppeteerService.closeAllPages(mockBrowser as Browser),
      ).resolves.not.toThrow();
    });
  });

  describe('getBrowser', () => {
    it('should return existing browser if it exists', async () => {
      puppeteerService['browser'] = mockBrowser as Browser;
      const browser = await puppeteerService.getBrowser();
      expect(browser).toBe(mockBrowser);
    });

    it('should create a new browser if none exists', async () => {
      const browser = await puppeteerService.getBrowser();
      expect(mockedPuppeteer.launch).toHaveBeenCalled();
      expect(browser).toBe(mockBrowser);
    });
  });

  // describe('closeBrowser', () => {
  //   it('should close the browser', async () => {
  //     (puppeteerService as any).browser = mockBrowser;
  //     await puppeteerService.closeBrowser();
  //     expect(mockBrowser.close).toHaveBeenCalled();
  //   });

  //   it('should not throw if browser is null', async () => {
  //     (puppeteerService as any).browser = null;
  //     await expect(puppeteerService.closeBrowser()).resolves.not.toThrow();
  //   });
  // });

  // describe('killBrowser', () => {
  //   it('should kill the browser process', async () => {
  //     (puppeteerService as any).browser = mockBrowser;
  //     await puppeteerService.killBrowser();
  //     expect(mockBrowser.process().kill).toHaveBeenCalled();
  //   });

  //   it('should not throw if browser is null', async () => {
  //     (puppeteerService as any).browser = null;
  //     await expect(puppeteerService.killBrowser()).resolves.not.toThrow();
  //   });
  // });
});
