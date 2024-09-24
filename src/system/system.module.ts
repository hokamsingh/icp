import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SettingsModule } from '../settings';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
