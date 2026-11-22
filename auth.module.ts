import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthorizationGuard } from './guards/roles.guard';
import type { Env } from '../config/env.validation';

// Phase 4 adds: OTP request/verify, refresh rotation, logout, device registration.
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<Env, true>) => ({
        secret: c.get('JWT_ACCESS_SECRET'),
        signOptions: { algorithm: 'HS256', expiresIn: c.get('JWT_ACCESS_TTL_SECONDS') },
      }),
    }),
  ],
  providers: [TokenService, JwtAuthGuard, AuthorizationGuard],
  exports: [TokenService, JwtAuthGuard, AuthorizationGuard],
})
export class AuthModule {}
