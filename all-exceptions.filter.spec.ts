import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';

function run(exception: unknown) {
  const json = jest.fn();
  const res = { status: jest.fn().mockReturnValue({ json }) };
  const host = { switchToHttp: () => ({ getRequest: () => ({ id: 'req-1', url: '/v1/x' }), getResponse: () => res }) } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return { status: res.status.mock.calls[0][0], body: json.mock.calls[0][0] };
}

describe('AllExceptionsFilter', () => {
  it('maps validation errors to details[]', () => {
    const { status, body } = run(new BadRequestException(['name must be a string']));
    expect(status).toBe(400);
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.details).toEqual(['name must be a string']);
    expect(body.requestId).toBe('req-1');
  });
  it('maps http exceptions', () => {
    const { status, body } = run(new NotFoundException('nope'));
    expect(status).toBe(404);
    expect(body.message).toBe('nope');
  });
  it('maps Prisma unique violations to 409 without leaking internals', () => {
    const e = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on the fields: (`email`)', { code: 'P2002', clientVersion: 'x' });
    const { status, body } = run(e);
    expect(status).toBe(409);
    expect(JSON.stringify(body)).not.toContain('email');
  });
  it('hides unknown errors behind a 500', () => {
    const { status, body } = run(new Error('secret db password leaked'));
    expect(status).toBe(500);
    expect(body.message).toBe('Internal server error');
  });
});
