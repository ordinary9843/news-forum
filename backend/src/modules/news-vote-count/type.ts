import { VoteStatistics } from '../../apis/news-vote/dto.js';
import { Bias } from '../../entities/news-vote/enum.js';

export type AnalyzeVoteStatisticsParams = {
  newsId: number;
  bias: Bias;
};

export type InitializeVoteCountsResult = void;

export type AnalyzeVoteStatisticsResult = VoteStatistics;

export type IncreaseVoteCountResult = void;
