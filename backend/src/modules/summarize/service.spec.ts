// npm run test -- ./src/modules/summarize/service.spec.ts

import { extractFromHtml } from '@extractus/article-extractor';

import { Test } from '@nestjs/testing';

import { SummarizeService } from './service.js';

jest.mock('@extractus/article-extractor', () => ({
  extractFromHtml: jest.fn(),
}));

const mockContent = 'mock.content';
const mockBrief = 'mock.brief';
const mockDescription = 'mock.description';
const mockHtml = 'mock.html';
const mockArticle = { content: mockContent };

describe('SummarizeService', () => {
  let summarizeService: SummarizeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SummarizeService],
    }).compile();
    summarizeService = module.get<SummarizeService>(SummarizeService);
  });

  describe('extractNewsFromHtml', () => {
    it('should extract news content successfully', async () => {
      (extractFromHtml as jest.Mock).mockResolvedValue(mockArticle);
      jest
        .spyOn(summarizeService, 'sanitizeContent')
        .mockReturnValue(mockDescription);
      jest
        .spyOn(summarizeService, 'truncateDescription')
        .mockReturnValue(mockBrief);
      expect(await summarizeService.extractNewsFromHtml(mockHtml)).toEqual({
        brief: mockBrief,
        description: mockDescription,
      });
      expect(extractFromHtml).toHaveBeenCalledWith(mockHtml);
      expect(summarizeService.sanitizeContent).toHaveBeenCalledWith(
        mockContent,
      );
      expect(summarizeService.sanitizeContent).toHaveBeenCalledTimes(1);
      expect(summarizeService.truncateDescription).toHaveBeenCalledWith(
        mockDescription,
      );
      expect(summarizeService.truncateDescription).toHaveBeenCalledTimes(1);
    });

    it('should throw bad request exception if content is missing', async () => {
      (extractFromHtml as jest.Mock).mockResolvedValue({});
      expect(await summarizeService.extractNewsFromHtml(mockHtml)).toEqual({
        brief: '',
        description: '',
      });
      expect(extractFromHtml).toHaveBeenCalledWith(mockHtml);
    });

    it('should log an error and return empty strings on error', async () => {
      (extractFromHtml as jest.Mock).mockRejectedValue(new Error());
      expect(await summarizeService.extractNewsFromHtml(mockHtml)).toEqual({
        brief: '',
        description: '',
      });
    });
  });

  describe('sanitizeContent', () => {
    it('should sanitize content correctly', () => {
      expect(summarizeService.sanitizeContent(mockContent)).toEqual(
        mockContent,
      );
    });
  });

  describe('truncateDescription', () => {
    it('should truncate the description to the specified length', () => {
      expect(summarizeService.truncateDescription(mockDescription)).toEqual(
        mockDescription,
      );
    });
  });
});
