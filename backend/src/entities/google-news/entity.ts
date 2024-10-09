import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant.js';

import { GOOGLE_NEWS_TABLE } from './constant.js';

@Entity(GOOGLE_NEWS_TABLE)
export class GoogleNewsEntity {
  @AfterLoad()
  setup(): void {}

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'text', unique: true })
  guid: string;

  @Column({ type: 'text', nullable: true })
  link: string;

  @Column({ type: 'text', nullable: true })
  html: string;

  @Column({
    name: 'retrieve_count',
    type: 'int',
    default: 0,
  })
  retrieveCount: number;

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
