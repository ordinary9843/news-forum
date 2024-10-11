import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  AfterLoad,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant.js';

import { BIAS_ENUM_NAME, NEWS_VOTE_TABLE } from './constant.js';
import { Bias } from './enum.js';

@Entity(NEWS_VOTE_TABLE)
export class NewsVoteEntity {
  @AfterLoad()
  setup(): void {}

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'news_id', type: 'int' })
  newsId: number;

  @Column({ type: 'enum', enumName: BIAS_ENUM_NAME })
  bias: Bias;

  @Column({
    name: 'voted_ip',
    type: 'varchar',
    length: 20,
  })
  votedIp: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: TIMESTAMP_PRECISION,
    default: () => DEFAULT_TIMESTAMP,
  })
  createdAt: Date;
}
