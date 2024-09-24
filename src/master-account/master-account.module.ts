import { Module } from '@nestjs/common';
import { MasterAccountService } from './master-account.service';
import { MasterAccountController } from './master-account.controller';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [MasterAccountController],
  providers: [MasterAccountService],
})
export class MasterAccountModule {}
