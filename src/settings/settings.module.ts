import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
