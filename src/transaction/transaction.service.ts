/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EntryType } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReceipt(
    date: Date,
    fromMasterAccountId: number,
    fromMasterSubAccountId: number,
    toMasterSubAccountId: number,
    referenceId?: string,
    amount?: number,
    commission?: number,
    adat?: number,
    netReceived?: number,
    description?: string,
  ) {
    try {
      const fromMasterAccount =
        await this.prismaService.masterAccount.findUnique({
          where: { id: fromMasterAccountId },
        });
      if (!fromMasterAccount)
        throw new Error('From Master Account Id Not Found');

      const fromMasterSubAccount =
        await this.prismaService.subAccount.findUnique({
          where: {
            id: fromMasterSubAccountId,
          },
        });
      if (!fromMasterSubAccount)
        throw new Error('From Master Sub Account not found');

      const findToMasterAccountId =
        await this.prismaService.subAccount.findFirst({
          where: {
            id: toMasterSubAccountId,
          },
        });
      if (!findToMasterAccountId)
        throw new Error('To Master Account Id Not Found');

      const data = await this.prismaService.$transaction(async (tx) => {
        const receipt = await tx.receipt.create({
          data: {
            date: date,
            amount: amount || 0,
            description: description || '',
          },
        });
        // console.log('receipt', receipt);
        const transaction_debit = await tx.transaction.create({
          data: {
            receiptId: receipt.id,
            masterAccountId: fromMasterAccountId,
            subAccountId: fromMasterSubAccountId,
            amount: amount || 0,
            entryType: EntryType.DEBIT,
          },
        });
        // console.log('tra_de', transaction_debit);
        const transaction_credit = await tx.transaction.create({
          data: {
            receiptId: receipt.id,
            masterAccountId: findToMasterAccountId.masterAccountId,
            referenceId,
            subAccountId: toMasterSubAccountId,
            amount: netReceived || 0,
            entryType: EntryType.CREDIT,
          },
        });
        // console.log('tra_cr', transaction_credit);
        const transaction_commission = await tx.transaction.create({
          data: {
            receiptId: receipt.id,
            amount: (amount || 0) - (netReceived || 0) || 0,
            entryType: EntryType.CREDIT,
            commission: commission,
            adat: adat,
          },
        });
        return receipt;
      });
    } catch (error) {
      // console.log('error', error);
      throw Error('Error Creating Receipt');
    }
  }

  async getUnassignedReceipts() {
    return this.prismaService.receipt.findMany({
      where: {
        isAssigned: false,
      },
    });
  }

  async getAllReceipt() {
    try {
      const receipts = await this.prismaService.receipt.findMany({
        include: {
          transactions: {
            include: {
              masterAccount: true,
              subAccount: true,
            },
          },
        },
      });
      return receipts;
    } catch (error) {
      throw new Error('Error fetching receipts');
    }
  }

  async createVoucher(
    date: Date,
    toMasterAccountId: number,
    toMasterSubAccountId: number,
    fromMasterSubAccountId: number,
    referenceId?: string,
    amount?: number,
    commission?: number,
    adat?: number,
    netReceived?: number,
    description?: string,
    receiptId?: number,
  ) {
    try {
      const findFromMasterAccountId =
        await this.prismaService.subAccount.findFirst({
          where: {
            id: fromMasterSubAccountId,
          },
        });
      if (!findFromMasterAccountId)
        throw new Error('From Master Account Id Not Found');

      const data = await this.prismaService.$transaction(async (tx) => {
        const voucher = await tx.voucher.create({
          data: {
            date: date,
            amount: amount || 0,
            description: description || '',
            receiptId: receiptId,
          },
        });
        // console.log('voucher', voucher);
        const transaction_debit = await tx.transaction.create({
          data: {
            voucherId: voucher.id,
            masterAccountId: toMasterAccountId,
            subAccountId: toMasterSubAccountId,
            amount: amount || 0,
            entryType: EntryType.DEBIT,
          },
        });
        // console.log('tra_de', transaction_debit);
        const transaction_credit = await tx.transaction.create({
          data: {
            voucherId: voucher.id,
            masterAccountId: findFromMasterAccountId.masterAccountId,
            subAccountId: toMasterSubAccountId,
            referenceId,
            amount: netReceived || 0,
            entryType: EntryType.CREDIT,
          },
        });
        // console.log('tra_cr', transaction_credit);
        const transaction_commission = await tx.transaction.create({
          data: {
            voucherId: voucher.id,
            amount: (amount || 0) - (netReceived || 0) || 0,
            entryType: EntryType.CREDIT,
            commission: commission,
            adat: adat,
          },
        });
        return voucher;
      });
    } catch (error) {
      // console.log('error', error);
      throw Error('Error Creating Receipt');
    }
  }

  async getAllVoucher() {
    try {
      const voucher = await this.prismaService.voucher.findMany({
        include: {
          transactions: {
            include: {
              masterAccount: true,
              subAccount: true,
            },
          },
        },
      });
      return voucher;
    } catch (error) {
      throw new Error('Error fetching receipts');
    }
  }

  async mergeReceipt() {
    return this.prismaService.voucher.findMany({
      include: {
        receipt: {
          include: {
            transactions:{
              include: {
                masterAccount: {
                  select: {
                    accountHolderName: true
                  }
                }
              }
            }
           }
        },
       },
    });
  }
}
