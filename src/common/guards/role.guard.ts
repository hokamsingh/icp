import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { UserType } from '@Common';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    if (!request.user.type) return false;
    return this.validateRoles(roles, request.user.type);
  }

  validateRoles(roles: string[], userRole: string) {
    return roles.some((role) => userRole.toLowerCase() === role.toLowerCase());
  }
}
