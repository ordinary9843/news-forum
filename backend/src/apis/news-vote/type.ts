import { Bias } from '../../entities/news-vote/enum.js';

import { VoteStatistics } from './dto.js';

export type VoteMetrics = {
  count: number;
  percent: number;
};

export type CastVoteParams = {
  newsId: number;
  bias: Bias;
  votedIp: string;
};

export type DoesNewsVoteExistParams = {
  newsId: number;
  votedIp: string;
};

export type GenerateCastVoteCacheKeyParams = {
  newsId: number;
  votedIp: string;
};

export type DoesNewsVoteExistResult = boolean;

export type CastVoteResult = VoteStatistics;

export type GenerateCastVoteCacheKeyResult = string;
