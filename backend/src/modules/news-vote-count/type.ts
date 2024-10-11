import { NewsVoteCounts } from '../../apis/news-vote/dto.js';
import { Bias } from '../../entities/news-vote/enum.js';

export type IncreaseVoteCountParams = {
  newsId: number;
  bias: Bias;
};

export type IncreaseVoteCountResult = NewsVoteCounts;
