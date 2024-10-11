import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  AfterLoad,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant.js';

import { NewsEntity } from '../news/entity.js';
import { Bias } from '../news-vote/enum.js';

import { NEWS_VOTE_COUNT_TABLE } from './constant.js';

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

  @ManyToOne(() => NewsEntity, (news) => news.voteCounts)
  @JoinColumn({ name: 'news_id', referencedColumnName: 'id' })
  news: Relation<NewsEntity>;
}
