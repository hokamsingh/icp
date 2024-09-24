import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule, StorageService } from '@Common';
import { AppController } from './app.controller';
import { AppCacheInterceptor } from './app-cache.interceptor';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { RedisModule } from './redis';
import { MasterAccountModule } from './master-account/master-account.module';
import { TransactionModule } from './transaction/transaction.module';
import { CanisterService } from './canister/canister.service';
import { GameGateway, GamesGatewayModule } from './gateways';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: (storageService: StorageService) => ({
        ...storageService.defaultMulterOptions,
      }),
      inject: [StorageService],
    }),
    CacheModule.register({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    MasterAccountModule,
    TransactionModule,
    GamesGatewayModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AppCacheInterceptor,
    },
    CanisterService,
    GameGateway,
  ],
})
export class AppModule {}
