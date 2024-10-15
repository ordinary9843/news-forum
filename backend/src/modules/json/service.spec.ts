// npm run test -- ./src/modules/json/service.spec.ts

import { Test } from '@nestjs/testing';

import { JsonService } from './service.js';

describe('JsonService', () => {
  let jsonService: JsonService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JsonService],
    }).compile();
    jsonService = module.get<JsonService>(JsonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('stringify', () => {
    it('should successfully stringify the object', () => {
      expect(
        jsonService.stringify({
          name: 'John',
          age: 30,
          city: 'New York',
        }),
      ).toEqual(`{\"name\":\"John\",\"age\":30,\"city\":\"New York\"}`);
    });

    it('should successfully stringify the empty object', () => {
      expect(jsonService.stringify({})).toEqual(`{}`);
    });

    it('should successfully stringify the array', () => {
      expect(jsonService.stringify(['John', 30, 'New York'])).toEqual(
        `[\"John\",30,\"New York\"]`,
      );
    });

    it('should successfully stringify the empty array', () => {
      expect(jsonService.stringify({})).toEqual(`{}`);
    });

    it('should successfully stringify the empty string', () => {
      expect(jsonService.stringify('')).toEqual('""');
    });

    it('should successfully stringify when input is null', () => {
      expect(jsonService.stringify(null)).toEqual('null');
      expect(jsonService.stringify('null')).toEqual('"null"');
    });

    it('should successfully stringify when input is undefined', () => {
      expect(jsonService.stringify(undefined)).toEqual(undefined);
      expect(jsonService.stringify('undefined')).toEqual('"undefined"');
    });

    it('should successfully stringify when input is integer', () => {
      expect(jsonService.stringify(0)).toEqual('0');
      expect(jsonService.stringify(1)).toEqual('1');
    });

    it('should successfully stringify when input is float', () => {
      expect(jsonService.stringify(0.0)).toEqual('0');
      expect(jsonService.stringify(1.1)).toEqual('1.1');
    });

    it('should return an empty string when input is circular object', () => {
      const circularObject = {
        self: null,
      };
      circularObject.self = circularObject;
      expect(jsonService.stringify(circularObject)).toEqual('');
    });

    it('should return an empty string when input is bigint', () => {
      expect(jsonService.stringify(BigInt(123))).toEqual('');
    });
  });

  describe('parse', () => {
    it('should parse a valid json string', () => {
      expect(
        jsonService.parse('{"name":"John", "age":30, "city":"New York"}'),
      ).toEqual({ name: 'John', age: 30, city: 'New York' });
    });

    it('should return an empty object for an invalid json string', () => {
      expect(
        jsonService.parse('{name: John, age: 30, city: New York}'),
      ).toEqual({});
    });

    it('should return null when input is null', () => {
      expect(jsonService.parse(null)).toBe(null);
      expect(jsonService.parse('null')).toBe(null);
    });

    it('should return an empty object when input is undefined', () => {
      expect(jsonService.parse(undefined)).toEqual({});
      expect(jsonService.parse('undefined')).toEqual({});
    });
  });
});
