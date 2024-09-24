import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AdminStatus, UserStatus } from '@prisma/client';
import { AuthenticatedUser, UserType } from '../types';
import { PrismaService } from '../../prisma';

export const getAccessGuardCacheKey = (user: { id: number; type: string }) =>
  `${user.type}-${user.id}-access`.toLowerCase();

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) return false;
    return await this.validate(user);
  }

  async validate(user: AuthenticatedUser) {
    const cacheKey = getAccessGuardCacheKey(user);
    const cacheTtl = 300000;

    if (await this.cacheManager.get(cacheKey)) return true;
    if (user.type === UserType.User) {
      const userInfo = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      if (userInfo?.status !== UserStatus.Active) {
        await this.cacheManager.set(cacheKey, false, cacheTtl);
        throw new UnauthorizedException();
      }
    } else if (user.type === UserType.Admin) {
      const userInfo = await this.prisma.admin.findUnique({
        where: { id: user.id },
      });
      if (userInfo?.status !== AdminStatus.Active) {
        await this.cacheManager.set(cacheKey, false, cacheTtl);
        throw new UnauthorizedException();
      }
    }

    await this.cacheManager.set(cacheKey, true, cacheTtl);
    return true;
  }
}
