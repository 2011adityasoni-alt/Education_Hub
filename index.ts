import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth.types';
import type { PermissionKey, RoleKey } from '../permissions';

export const IS_PUBLIC = 'isPublic';
export const ROLES = 'roles';
export const PERMS = 'permissions';

/** Opt a route OUT of authentication. Everything is private by default. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
/** User must hold at least one of these roles. */
export const Roles = (...roles: RoleKey[]) => SetMetadata(ROLES, roles);
/** User must hold ALL of these permissions. */
export const RequirePermissions = (...perms: PermissionKey[]) => SetMetadata(PERMS, perms);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => ctx.switchToHttp().getRequest().user,
);
