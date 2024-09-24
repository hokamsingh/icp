/* eslint-disable prettier/prettier */
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  toMasterAccountId: number;

  @IsNumber()
  @IsNotEmpty()
  toMasterSubAccountId: number;

  @IsNumber()
  @IsNotEmpty()
  fromMasterSubAccountId: number;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsNumber()
  @IsOptional()
  receiptId?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsNumber()
  @IsOptional()
  adat?: number;

  @IsNumber()
  @IsOptional()
  netReceived?: number;

  @IsString()
  @IsOptional()
  description: string;
}
