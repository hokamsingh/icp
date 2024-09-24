import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImageRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profileImage: string;
}
