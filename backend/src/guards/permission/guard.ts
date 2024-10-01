import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SignAuthEntityDto } from '../../apis/auth/dto';
import { AuthService } from '../../apis/auth/service';
import { Request } from '../../apis/interface';

import { AuthScope } from './type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authScope: AuthScope = this.reflector.get<AuthScope>(
      'authScope',
      context.getHandler(),
    );
    if (authScope) {
      const { type, permission }: AuthScope = authScope;
      const { user }: Request = context.switchToHttp().getRequest();
      const { type: userType = null, identifier }: SignAuthEntityDto = user;
      if (type !== userType) {
        throw new ForbiddenException(
          'Auth type does not match the required permissions',
        );
      }

      const hasPermission: boolean = await this.authService.hasPermission(
        type,
        identifier,
        permission,
      );
      if (!hasPermission) {
        throw new ForbiddenException('No access permission');
      }

      return hasPermission;
    }

    return true;
  }
}
