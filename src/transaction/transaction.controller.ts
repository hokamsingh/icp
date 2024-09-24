/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateReceiptDto, CreateVoucherDto } from './dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @Post('create-receipt')
  async createReceipt(@Body() data: CreateReceiptDto) {
    const receipt = await this.transactionService.createReceipt(
      data.date,
      data.fromMasterAccountId,
      data.fromMasterSubAccountId,
      data.toMasterSubAccountId,
      data.referenceId,
      data.amount,
      data.commission,
      data.adat,
      data.netReceived,
      data.description,
    );
    return { status: 'success', data: receipt };
  }

  @Get('receipts-unassigned')
  async getUnassignedReceipts() {
    const receipts = await this.transactionService.getUnassignedReceipts();
    return { success: 'success', data: receipts };
  }

  @Get('all-receipt')
  async getAllReceipt() {
    const getReceipt = await this.transactionService.getAllReceipt();
    return { status: 'success', data: getReceipt };
  }

  @Post('create-voucher')
  async createVoucher(@Body() data: CreateVoucherDto) {
    const voucher = await this.transactionService.createVoucher(
      data.date,
      data.toMasterAccountId,
      data.toMasterSubAccountId,
      data.fromMasterSubAccountId,
      data.referenceId,
      data.amount,
      data.commission,
      data.adat,
      data.netReceived,
      data.description,
      data.receiptId,
    );
    return { status: 'success', data: voucher };
  }

  @Get('all-voucher')
  async getAllVoucher() {
    const getVoucher = await this.transactionService.getAllVoucher();
    return { success: 'success', data: getVoucher };
  }

  @Get('merge-receipt-id')
  async mergeReceipt() {
    const vouchers = await this.transactionService.mergeReceipt();
    return { success: 'success', data: vouchers };
  }
}
