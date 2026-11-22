import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const u = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, createdAt: true }, // never passwordHash
    });
    if (!u) throw new NotFoundException('User not found');
    return { ...u, roles: user.roles };
  }
}
