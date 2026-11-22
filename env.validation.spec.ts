import { validateEnv } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'x'.repeat(40),
};

describe('validateEnv', () => {
  it('accepts a valid config and applies defaults', () => {
    const env = validateEnv(base);
    expect(env.PORT).toBe(3000);
    expect(env.JWT_ACCESS_TTL_SECONDS).toBe(900);
    expect(env.TRUST_PROXY_HOPS).toBe(0);
  });
  it('rejects a short JWT secret', () => {
    expect(() => validateEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
  });
  it('rejects an access-token TTL above one hour', () => {
    expect(() => validateEnv({ ...base, JWT_ACCESS_TTL_SECONDS: '7200' })).toThrow(/JWT_ACCESS_TTL_SECONDS/);
  });
  it('rejects a missing database url', () => {
    expect(() => validateEnv({ JWT_ACCESS_SECRET: base.JWT_ACCESS_SECRET })).toThrow(/DATABASE_URL/);
  });
  it('rejects placeholder secrets in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production', JWT_ACCESS_SECRET: 'REPLACE_ME'.padEnd(40, '_') })).toThrow(/placeholder/);
  });
});
