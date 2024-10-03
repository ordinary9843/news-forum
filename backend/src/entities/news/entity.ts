import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant';

import { CATEGORY_ENUM_NAME, LOCALE_ENUM_NAME, TABLE_NAME } from './constant';
import { Category, Locale } from './enum';

@Entity(TABLE_NAME)
export class NewsEntity {
  @AfterLoad()
  setup(): void {}

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'enum', enumName: LOCALE_ENUM_NAME })
  locale: Locale;

  @Column({ type: 'enum', enumName: CATEGORY_ENUM_NAME })
  category: Category;

  @Column({ type: 'text', unique: true })
  guid: string;

  @Column({ name: 'google_link', type: 'text' })
  googleLink: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  link: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 128 })
  source: string;

  @Column({
    name: 'is_metadata_retrieved',
    type: 'boolean',
    default: false,
  })
  isMetadataRetrieved: boolean;

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
