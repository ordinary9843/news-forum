import { AccessTokenType } from '../../modules/jwt/enum';

export type AuthScope = {
  type: AccessTokenType;
  module: string;
  permission: string;
  action: string;
};
