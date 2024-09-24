import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class JoinGameDto {
  @ApiProperty()
  @IsNumber()
  gameId: number;

  @ApiProperty()
  @IsNumber()
  userId: number;
}
