// npm run test -- ./src/modules/json/service.spec.ts

import { Test } from '@nestjs/testing';

import { BaseTestSuite } from '../../../test/base/test-suite/abstract.test.suite';

import {
  InitializeResult,
  RunTestsResult,
} from '../../../test/base/test-suite/type';

import { JsonService } from './service';

class JsonServiceTest extends BaseTestSuite {
  private jsonService: JsonService;

  async initialize(): Promise<InitializeResult> {
    this.module = await Test.createTestingModule({
      providers: [JsonService],
    }).compile();
    this.jsonService = this.module.get<JsonService>(JsonService);
  }

  async runTests(): Promise<RunTestsResult> {
    beforeEach(async () => {
      await this.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe('stringify', () => {
      it('should successfully stringify the object', () => {
        expect(
          this.jsonService.stringify({
            name: 'John',
            age: 30,
            city: 'New York',
          }),
        ).toEqual(`{\"name\":\"John\",\"age\":30,\"city\":\"New York\"}`);
      });

      it('should successfully stringify the empty object', () => {
        expect(this.jsonService.stringify({})).toEqual(`{}`);
      });

      it('should successfully stringify the array', () => {
        expect(this.jsonService.stringify(['John', 30, 'New York'])).toEqual(
          `[\"John\",30,\"New York\"]`,
        );
      });

      it('should successfully stringify the empty array', () => {
        expect(this.jsonService.stringify({})).toEqual(`{}`);
      });

      it('should successfully stringify the empty string', () => {
        expect(this.jsonService.stringify('')).toEqual('""');
      });

      it('should successfully stringify when input is null', () => {
        expect(this.jsonService.stringify(null)).toEqual('null');
        expect(this.jsonService.stringify('null')).toEqual('"null"');
      });

      it('should successfully stringify when input is undefined', () => {
        expect(this.jsonService.stringify(undefined)).toEqual(undefined);
        expect(this.jsonService.stringify('undefined')).toEqual('"undefined"');
      });

      it('should successfully stringify when input is integer', () => {
        expect(this.jsonService.stringify(0)).toEqual('0');
        expect(this.jsonService.stringify(1)).toEqual('1');
      });

      it('should successfully stringify when input is float', () => {
        expect(this.jsonService.stringify(0.0)).toEqual('0');
        expect(this.jsonService.stringify(1.1)).toEqual('1.1');
      });
    });

    describe('parse', () => {
      it('should parse a valid json string', () => {
        expect(
          this.jsonService.parse(
            '{"name":"John", "age":30, "city":"New York"}',
          ),
        ).toEqual({ name: 'John', age: 30, city: 'New York' });
      });

      it('should return an empty object for an invalid json string', () => {
        expect(
          this.jsonService.parse('{name: John, age: 30, city: New York}'),
        ).toEqual({});
      });

      it('should return null when input is null', () => {
        expect(this.jsonService.parse(null)).toBe(null);
        expect(this.jsonService.parse('null')).toBe(null);
      });

      it('should return an empty object when input is undefined', () => {
        expect(this.jsonService.parse(undefined)).toEqual({});
        expect(this.jsonService.parse('undefined')).toEqual({});
      });
    });
  }
}

new JsonServiceTest().runTests();
