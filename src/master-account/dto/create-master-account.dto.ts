/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMasterAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
