import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Parser } from 'xml2js';

@Injectable()
export class AppService {
  constructor() {}

  async test(): Promise<any> {
    try {
      const url: string =
        'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFptTXpJU0JYcG9MVlJYS0FBUAE?hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant';
      const response: any = await axios.get(url);
      const parser: any = new Parser();
      parser.parseString(response.data, (err: any, result: any) => {
        if (err) {
          throw new Error('XML Parsing Error: ' + err);
        }
        console.log(result.rss.channel);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
