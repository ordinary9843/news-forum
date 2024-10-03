import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';

import { Locale } from '../../apis/news/enum';
import { BaseEntity } from '../base/abstract.entity';
import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant';

import { LOCALE_ENUM_NAME, TABLE_NAME } from './constant';

@Entity(TABLE_NAME)
export class ExchangeRateEntity extends BaseEntity<ExchangeRateEntity> {
  @AfterLoad()
  setup(): void {}

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  date: string;

  @Column({ type: 'enum', enumName: LOCALE_ENUM_NAME })
  locale: Locale;

  @Column({ type: 'varchar', length: 255, unique: true })
  guid: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  link: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 128 })
  source: string;

  @Column({
    name: 'is_description_retrieved',
    type: 'boolean',
    default: false,
  })
  isDescriptionRetrieved: boolean;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    precision: TIMESTAMP_PRECISION,
  })
  publishedAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: TIMESTAMP_PRECISION,
    default: () => DEFAULT_TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: TIMESTAMP_PRECISION,
    default: () => DEFAULT_TIMESTAMP,
  })
  updatedAt: Date;
}
