import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsStrongPassword()
  newPassword: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message:
      'The mobile number you entered is invalid, please provide a valid mobile number',
  })
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}
