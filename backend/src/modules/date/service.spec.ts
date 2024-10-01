// npm run test -- ./src/modules/date/service.spec.ts

import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';

import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';

import { DateService } from './service';

const date: Date = new Date(2024, 1, 1, 13, 14, 15);

class DateServiceTest extends BaseTestSuite {
  private dateService: DateService;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [DateService],
    }).compile();
    this.dateService = this.module.get<DateService>(DateService);
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('format', () => {
      it('should format the date', () => {
        expect(this.dateService.format(date)).toBe('2024-02-01 13:14:15');
        expect(this.dateService.format(date, 'yyyy-MM-dd HH:mm:ss')).toBe(
          '2024-02-01 13:14:15',
        );
        expect(this.dateService.format(date, 'yyyy-MM-dd HH:mm')).toBe(
          '2024-02-01 13:14',
        );
        expect(this.dateService.format(date, 'yyyy-MM-dd HH')).toBe(
          '2024-02-01 13',
        );
        expect(this.dateService.format(date, 'yyyy-MM-dd')).toBe('2024-02-01');
        expect(this.dateService.format(date, 'yyyy-MM')).toBe('2024-02');
        expect(this.dateService.format(date, 'yyyy')).toBe('2024');
      });

      it('should return null if date is null', () => {
        expect(this.dateService.format(null)).toBe(null);
        expect(this.dateService.format(null, 'yyyy-MM-dd HH:mm:ss')).toBe(null);
      });
    });
  }
}

new DateServiceTest().runTests();
