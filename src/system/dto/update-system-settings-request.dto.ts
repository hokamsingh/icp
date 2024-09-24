import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiProperty()
  @IsInt()
  settingId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  selections?: string[];
}
export class UpdateSystemSettingsRequestDto {
  @ApiProperty({ type: [UpdateSystemSettingDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateSystemSettingDto)
  data: UpdateSystemSettingDto[];
}
