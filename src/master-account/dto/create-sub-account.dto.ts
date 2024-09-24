import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  masterAccountId: number;
}
