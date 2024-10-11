import { Bias } from '../../entities/news-vote/enum.js';
import { NewsVoteCounts } from '../news-vote/dto.js';

export type IncreaseVoteCountParams = {
  newsId: number;
  bias: Bias;
};

export type IncreaseVoteCountResult = NewsVoteCounts;
