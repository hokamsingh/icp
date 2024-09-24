import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginatedDto } from './paginated.dto';

export class SearchableDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class SearchablePaginatedDto extends PaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
