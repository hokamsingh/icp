/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from '../prisma';
import { PrismaService } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService],
})
export class TransactionModule {}
