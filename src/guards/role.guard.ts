import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Users } from '@prisma/client';
import { ROLES_KEY } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/role.enums';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest() as { user: Users };

    return requiredRoles.includes(user.role);
  }
}
