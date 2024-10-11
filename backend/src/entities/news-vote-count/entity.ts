import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  AfterLoad,
  UpdateDateColumn,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant.js';

import { NEWS_VOTE_COUNT_TABLE } from './constant.js';
import { Bias } from './enum.js';

@Entity(NEWS_VOTE_COUNT_TABLE)
export class NewsVoteCountEntity {
  @AfterLoad()
  setup(): void {}

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'news_id', type: 'int' })
  newsId: number;

  @Column({ type: 'enum', enumName: NEWS_VOTE_COUNT_TABLE })
  bias: Bias;

  @Column({ name: 'count', type: 'int', default: 0 })
  count: number;

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
