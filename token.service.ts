import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import type { AccessTokenPayload } from './auth.types';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccess(userId: string, tokenVersion: number): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, tv: tokenVersion, typ: 'access' };
    return this.jwt.signAsync(payload);
  }

  async verifyAccess(token: string): Promise<AccessTokenPayload> {
    try {
      const p = await this.jwt.verifyAsync<AccessTokenPayload>(token, { algorithms: ['HS256'] });
      if (p.typ !== 'access') throw new Error('wrong token type');
      return p;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /** Opaque random token (refresh tokens, etc). Store only hashToken(raw). */
  generateOpaqueToken(bytes = 48): string {
    return randomBytes(bytes).toString('base64url');
  }
  hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
