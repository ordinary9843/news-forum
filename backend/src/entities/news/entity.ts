import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  OneToMany,
  Relation,
  OneToOne,
} from 'typeorm';

import { TIMESTAMP_PRECISION, DEFAULT_TIMESTAMP } from '../constant.js';

import { NewsVoteEntity } from '../news-vote/entity.js';
import { NewsVoteCountEntity } from '../news-vote-count/entity.js';

import {
  CATEGORY_ENUM_NAME,
  LOCALE_ENUM_NAME,
  NEWS_TABLE,
} from './constant.js';
import { Category, Locale } from './enum.js';

@Entity(NEWS_TABLE)
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

  @Column({ type: 'text', nullable: true })
  link: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  brief: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 128 })
  source: string;

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

  @OneToOne(() => NewsVoteEntity, (newsVote) => newsVote.news)
  vote: Relation<NewsVoteEntity>;

  @OneToMany(() => NewsVoteCountEntity, (newsVoteCount) => newsVoteCount.news)
  voteCounts: Relation<NewsVoteCountEntity[]>;
}
