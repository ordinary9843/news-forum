import { Browser, Page } from 'puppeteer';

export type OpenPageResult = Page;

export type CloseBrowserResult = void;

export type ClosePageResult = void;

export type GetBrowserResult = Browser | null;

export type CloseAllPagesResult = void;

export type CreateBrowserResult = Browser;
