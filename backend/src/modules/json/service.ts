import { Injectable, Logger } from '@nestjs/common';

import { StringifyResult, ParseResult } from './type';

@Injectable()
export class JsonService {
  private readonly logger = new Logger(JsonService.name);

  stringify(data: unknown): StringifyResult {
    try {
      return JSON.stringify(data);
    } catch (error) {
      this.logger.error(`Failed to stringify data: ${error.message}`);

      return '';
    }
  }

  parse(json: string): ParseResult {
    try {
      return JSON.parse(json);
    } catch (error) {
      this.logger.error(`Failed to parse json: ${error.message}`);

      return {};
    }
  }
}
