import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMS, ROLES } from '../decorators';
import { AuthorizationGuard } from './roles.guard';

function ctx(user: unknown, meta: { roles?: string[]; perms?: string[] }): ExecutionContext {
  const reflector = { getAllAndOverride: (k: string) => (k === ROLES ? meta.roles : k === PERMS ? meta.perms : undefined) };
  const c = { switchToHttp: () => ({ getRequest: () => ({ user }) }), getHandler: () => null, getClass: () => null } as unknown as ExecutionContext;
  (c as any).__guard = new AuthorizationGuard(reflector as unknown as Reflector);
  return c;
}
const run = (user: unknown, meta: { roles?: string[]; perms?: string[] }) => {
  const c = ctx(user, meta);
  return (c as any).__guard.canActivate(c);
};

describe('AuthorizationGuard', () => {
  const teacher = { id: '1', roles: ['teacher'], permissions: ['course:write'] };
  it('allows routes without metadata', () => expect(run(teacher, {})).toBe(true));
  it('allows a matching role', () => expect(run(teacher, { roles: ['teacher'] })).toBe(true));
  it('denies a missing role', () => expect(() => run(teacher, { roles: ['admin'] })).toThrow(ForbiddenException));
  it('requires ALL permissions', () => {
    expect(run(teacher, { perms: ['course:write'] })).toBe(true);
    expect(() => run(teacher, { perms: ['course:write', 'payment:refund'] })).toThrow(ForbiddenException);
  });
  it('lets super_admin through', () => expect(run({ id: '2', roles: ['super_admin'], permissions: [] }, { perms: ['payment:refund'] })).toBe(true));
  it('denies when there is no user but metadata is set', () => expect(() => run(undefined, { roles: ['admin'] })).toThrow(ForbiddenException));
});
