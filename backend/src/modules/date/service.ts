import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import { DEFAULT_DATE_FORMAT } from './constant';
import { FormatResult } from './type';

@Injectable()
export class DateService {
  format(date: Date, dateFormat: string = DEFAULT_DATE_FORMAT): FormatResult {
    return date ? DateTime.fromJSDate(date).toFormat(dateFormat) : null;
  }
}
