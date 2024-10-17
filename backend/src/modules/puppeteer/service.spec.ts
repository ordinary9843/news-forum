// npm run test -- ./src/modules/puppeteer/service.spec.ts

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';

import { PuppeteerService } from './service.js';

jest.mock('puppeteer');

const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
const mockPage = {
  setExtraHTTPHeaders: jest.fn(),
  close: jest.fn(),
} as Partial<Page>;
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
  pages: jest.fn().mockResolvedValue([mockPage]),
  process: jest.fn().mockReturnValue({
    pid: 1234,
    kill: jest.fn().mockReturnValue(true),
  }),
} as Partial<Browser>;

describe('PuppeteerService', () => {
  let puppeteerService: PuppeteerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PuppeteerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('/path/to/chrome'),
          },
        },
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
      expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
      expect(page).toBe(mockPage);
    });

    it('should log an error if opening a page fails', async () => {
      jest.spyOn(mockBrowser, 'newPage').mockRejectedValueOnce(new Error());
      await expect(puppeteerService.openPage()).rejects.toThrow(new Error());
    });
  });

  describe('closePage', () => {
    it('should not call close when the page is undefined', async () => {
      await puppeteerService.closePage(undefined);
      expect(mockPage.close).not.toHaveBeenCalled();
    });

    it('should close the page', async () => {
      await puppeteerService.closePage(mockPage as Page);
      expect(mockPage.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeAllPages', () => {
    it('should close all pages', async () => {
      jest.spyOn(mockBrowser, 'pages').mockResolvedValue([mockPage] as Page[]);
      jest.spyOn(puppeteerService, 'closePage').mockResolvedValue(null);
      await puppeteerService.closeAllPages(mockBrowser as Browser);
      expect(mockBrowser.pages).toHaveBeenCalledTimes(1);
      expect(puppeteerService.closePage).toHaveBeenCalledWith(mockPage);
      expect(puppeteerService.closePage).toHaveBeenCalledTimes(1);
    });

    it('should not throw if there are no pages', async () => {
      jest.spyOn(mockBrowser, 'pages').mockResolvedValue([]);
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
      expect(mockedPuppeteer.launch).toHaveBeenCalledTimes(1);
      expect(browser).toBe(mockBrowser);
    });
  });

  describe('closeBrowser', () => {
    it('should not call close when the browser is undefined', async () => {
      await puppeteerService.closeBrowser(undefined);
      expect(mockBrowser.close).not.toHaveBeenCalled();
    });

    it('should close the browser', async () => {
      await puppeteerService.closeBrowser(mockBrowser as Browser);
      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });

    it('should not throw if browser is null', async () => {
      await expect(
        puppeteerService.closeBrowser(mockBrowser as Browser),
      ).resolves.not.toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call closeBrowser on module destroy', async () => {
      jest.spyOn(puppeteerService, 'closeBrowser').mockResolvedValue(undefined);
      await puppeteerService.onModuleDestroy();
      expect(puppeteerService.closeBrowser).toHaveBeenCalledTimes(1);
    });
  });
});
