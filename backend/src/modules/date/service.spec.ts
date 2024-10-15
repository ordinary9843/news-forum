// npm run test -- ./src/modules/date/service.spec.ts

import { Test } from '@nestjs/testing';

import { DateService } from './service';

const date = new Date(2024, 1, 1, 13, 14, 15);

describe('DateService', () => {
  let dateService: DateService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DateService],
    }).compile();
    dateService = module.get<DateService>(DateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('format', () => {
    it('should format the date', () => {
      expect(dateService.format(date)).toBe('2024-02-01 13:14:15');
      expect(dateService.format(date, 'yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-02-01 13:14:15',
      );
      expect(dateService.format(date, 'yyyy-MM-dd HH:mm')).toBe(
        '2024-02-01 13:14',
      );
      expect(dateService.format(date, 'yyyy-MM-dd HH')).toBe('2024-02-01 13');
      expect(dateService.format(date, 'yyyy-MM-dd')).toBe('2024-02-01');
      expect(dateService.format(date, 'yyyy-MM')).toBe('2024-02');
      expect(dateService.format(date, 'yyyy')).toBe('2024');
    });

    it('should return null if date is null', () => {
      expect(dateService.format(null)).toBe(null);
      expect(dateService.format(null, 'yyyy-MM-dd HH:mm:ss')).toBe(null);
    });
  });
});
