import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../token.service';
import { IS_PUBLIC } from '../decorators';
import type { AuthenticatedUser } from '../auth.types';

/**
 * Global guard. Every request to a non-@Public route must carry a valid access token AND
 * the user must still be ACTIVE with an unchanged tokenVersion. Roles/permissions are
 * loaded from the DB on each request (never trusted from the token) so revocation is
 * immediate. Add a short-TTL cache here if this becomes a hotspot.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()])) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');

    const payload = await this.tokens.verifyAccess(header.slice(7));
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        status: true, tokenVersion: true, deletedAt: true,
        roles: { select: { role: { select: { key: true, permissions: { select: { permission: { select: { key: true } } } } } } } },
      },
    });
    if (!user || user.deletedAt || user.status !== 'ACTIVE' || user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const authed: AuthenticatedUser = {
      id: payload.sub,
      roles: user.roles.map((r) => r.role.key),
      permissions: [...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.key)))],
    };
    req.user = authed;
    return true;
  }
}
