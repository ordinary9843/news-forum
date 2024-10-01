import { Controller } from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';

import { AppService } from './service';

@Controller('app')
@ApiTags(AppController.name)
export class AppController {
  constructor(private readonly appService: AppService) {}
}
