import { VoteStatistics } from '../../apis/news-vote/dto.js';
import { Bias } from '../../entities/news-vote/enum.js';

export type CalculateVoteStatisticsParams = {
  newsId: number;
  bias: Bias;
};

export type InitializeVoteCountsResult = void;

export type CalculateVoteStatisticsResult = VoteStatistics;

export type IncreaseVoteCountResult = void;

export type FormatBiasResult = string;
