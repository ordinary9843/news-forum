import { TestingModule } from '@nestjs/testing';

import { TestSuiteManager } from './interface';
import { InitializeResult, RunTestsResult } from './type';

export abstract class BaseTestSuite implements TestSuiteManager {
  protected module: TestingModule;

  async initialize(): Promise<InitializeResult> {}

  async runTests(): Promise<RunTestsResult> {}
}
