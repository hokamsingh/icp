import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticateRequestDto {
  @ApiProperty()
  @IsString()
  password: string;
}
