import { ApiProperty } from '@nestjs/swagger';

export class App {
  [key: string]: unknown;

  @ApiProperty({ example: 'App Name' })
  appName: string;

  @ApiProperty({ example: 'Keyword1,Keyword2,Keyword3' })
  metaKeyword: string;

  @ApiProperty({ example: 'Popular application' })
  metaDescription: string;

  @ApiProperty({ example: 'http://localhost:3000' })
  serverUrl: string;

  @ApiProperty({ example: 'http://localhost:3000/api' })
  apiUrl: string;

  @ApiProperty({ example: 'http://localhost:3333' })
  webUrl: string;

  @ApiProperty({ example: 'test@example.com' })
  serviceEmail: string;

  @ApiProperty({ example: 0 })
  likeCount: number;

  @ApiProperty({ example: false })
  isClosedApp: boolean;
}