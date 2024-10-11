import { Bias } from '../../entities/news-vote/enum.js';

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

export type CastVoteResult = void;

export type GenerateCastVoteCacheKeyResult = string;
