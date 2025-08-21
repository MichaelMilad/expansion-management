import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.CLIENT && !user.clientId) {
      throw new ForbiddenException(
        'Client user not linked to a client account',
      );
    }

    if (params.clientId && user.clientId !== parseInt(params.clientId)) {
      throw new ForbiddenException(
        'Access denied to resource not owned by your client',
      );
    }

    return true;
  }
}
