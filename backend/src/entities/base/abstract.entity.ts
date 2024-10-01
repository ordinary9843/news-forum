import { BaseEntityContractor } from './interface';

export abstract class BaseEntity<T> implements BaseEntityContractor {
  id: number;

  abstract setup(entity: T): void;
}
