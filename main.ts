import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import type { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);
  app.useLogger(app.get(Logger));

  configureApp(app);
  const origins = config.get('CORS_ORIGINS').split(',').map((s: string) => s.trim()).filter(Boolean);
  app.enableCors({ origin: origins.length ? origins : false, credentials: true });
  app.enableShutdownHooks();

  if (config.get('NODE_ENV') !== 'production') {
    const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Education Hub API').setVersion('0.1').addBearerAuth().build());
    SwaggerModule.setup('docs', app, doc);
  }
  await app.listen(config.get('PORT'));
}
bootstrap();
