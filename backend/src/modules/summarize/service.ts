import { inspect } from 'util';

import { extractFromHtml } from '@extractus/article-extractor';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { convert } from 'html-to-text';
import _ from 'lodash';

import {
  ExtractNewsFromHtmlResult,
  SanitizeContentResult,
  TruncateDescriptionResult,
} from './type.js';

@Injectable()
export class SummarizeService {
  private readonly logger = new Logger(SummarizeService.name);

  async extractNewsFromHtml(html: string): Promise<ExtractNewsFromHtmlResult> {
    try {
      const article = await extractFromHtml(html);
      if (!_.has(article, 'content')) {
        throw new BadRequestException('Failed to extract html');
      }

      const { content } = article;
      const description = this.sanitizeContent(content);

      return {
        brief: this.truncateDescription(description),
        description,
      };
    } catch (error) {
      this.logger.error(
        `summarizeNewsFromHtml(): Failed to summarize news (error=${inspect(error)})`,
      );
    }

    return {
      brief: '',
      description: '',
    };
  }

  sanitizeContent(content: string): SanitizeContentResult {
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

  truncateDescription(description: string): TruncateDescriptionResult {
    return _.truncate(description, {
      length: 150,
      omission: '...',
    });
  }
}
