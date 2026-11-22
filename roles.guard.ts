import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMS, ROLES } from '../decorators';
import { ROLE_KEYS } from '../permissions';
import type { AuthenticatedUser } from '../auth.types';

/** Enforces @Roles() and @RequirePermissions(). Runs after JwtAuthGuard. super_admin passes both checks. */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const targets = [ctx.getHandler(), ctx.getClass()];
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES, targets);
    const perms = this.reflector.getAllAndOverride<string[] | undefined>(PERMS, targets);
    if (!roles?.length && !perms?.length) return true;

    const user: AuthenticatedUser | undefined = ctx.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Access denied'); // public route with role metadata = misconfiguration
    if (user.roles.includes(ROLE_KEYS.SUPER_ADMIN)) return true;

    if (roles?.length && !roles.some((r) => user.roles.includes(r))) throw new ForbiddenException('Access denied');
    if (perms?.length && !perms.every((p) => user.permissions.includes(p))) throw new ForbiddenException('Access denied');
    return true;
  }
}
