/* eslint-disable prettier/prettier */
import { Injectable, Search } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class MasterAccountService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNewMaster(name: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const result = await tx.masterAccount.create({
          data: {
            accountHolderName: name,
          },
        });
        const subAccount = await tx.subAccount.create({
          data: {
            masterAccountId: result.id,
            bankName: 'Cash',
          },
        });
        return result;
      });
    } catch (error) {
      throw Error('Error Creating Master Account');
    }
  }

  async createSubAccount(name: string, masterAccountId: number) {
    try {
      const result = await this.prismaService.subAccount.create({
        data: {
          masterAccountId: masterAccountId,
          bankName: name,
        },
      });
      return result;
    } catch (error) {
      throw Error('Error Creating Sub Account');
    }
  }

  async getAllMasterAccounts(search?: string) {
    const where: Prisma.MasterAccountWhereInput = {};

    if (search) {
      const _search = search.trim();
      console.log('search', search);
      where.OR = [
        {
          accountHolderName: {
            contains: _search,
            mode: 'insensitive',
          },
        },
      ];
    }

    try {
      const masterAccounts = await this.prismaService.masterAccount.findMany({
        where,
      });
      console.log('masterAccounts', masterAccounts);
      return masterAccounts;
    } catch (error) {
      throw new Error('Error fetching all master accounts');
    }
  }

  async getSubAccount(masterId: number, search?: string) {
    // console.log(search);

    const where: Prisma.SubAccountWhereInput = {};
    {
      try {
        const subAccount = await this.prismaService.subAccount.findMany({
          where: {
            masterAccountId: masterId,
            bankName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        });

        return subAccount;
      } catch (error) {
        throw new Error('Error Fetching SubAccount');
      }
    }
  }

  // async getMasToSubAccount(userId: number, masterId: number, search?: string) {
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       id: userId,
  //     },
  //     include: {},
  //   });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   // console.log(userId, search, masterId);

  //   const masterAccount = await this.prismaService.masterAccount.findFirst({
  //     where: {
  //       id: masterId,
  //     },
  //   });

  //   if (!masterAccount) {
  //     throw new Error('Master account not found or access denied');
  //   }

  //   console.log('user', user.id, 'masterAccount', masterAccount);

  //   const subAccounts = await this.prismaService.subAccount.findMany({
  //     where: {
  //       masterAccountId: masterId,
  //       bankName: {
  //         contains: search,
  //         mode: 'insensitive',
  //       },
  //     },
  //   });

  //   return subAccounts;
  // }
}
