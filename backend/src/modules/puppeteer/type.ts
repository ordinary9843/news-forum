import { Browser, HTTPRequest, Page } from 'puppeteer';

export type BrowserStatus = {
  usageCount: number;
  expiredAt?: number;
};

export type Headers = Record<string, string>;

export type Payload = string | undefined;

export type CapturedRequest = {
  url: string;
  headers: Headers;
  payload: Payload;
};

export type RequestFilter = (request: HTTPRequest) => boolean;

export type OpenBrowserPageResult = {
  browser: Browser;
  page: Page;
};

export type CloseBrowserResult = void;

export type ClosePageResult = void;

export type ExtractRequestResult = CapturedRequest;

export type GetBrowserResult = Browser | null;

export type GetAvailableBrowserResult = Browser;

export type CreateBrowserResult = Browser;

export type ShouldCreateBrowserResult = boolean;

export type ShouldMarkBrowserExpiredResult = boolean;

export type MarkBrowserExpiredResult = void;

export type DeleteExpiredBrowsersResult = void;

export type CloseAllBrowsersResult = void;

export type CloseAllPagesResult = void;
