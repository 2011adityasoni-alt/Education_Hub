import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Env } from './config/env.validation';

/** Everything that changes request handling. Shared by main.ts and the e2e tests. */
export function configureApp(app: INestApplication): void {
  const hops = app.get(ConfigService<Env, true>).get('TRUST_PROXY_HOPS');
  // Behind a proxy, req.ip would be the proxy for EVERY user and they would share one rate-limit bucket.
  if (hops > 0) (app as unknown as NestExpressApplication).set('trust proxy', hops);

  app.use(helmet());
  app.setGlobalPrefix('v1', { exclude: ['health/live', 'health/ready'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}
