/* eslint-disable prettier/prettier */
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReceiptDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  fromMasterAccountId: number;

  @IsNumber()
  @IsNotEmpty()
  fromMasterSubAccountId: number;

  @IsNumber()
  @IsNotEmpty()
  toMasterSubAccountId: number;

  @IsString()
  @IsOptional()
  referenceId?: string;

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
