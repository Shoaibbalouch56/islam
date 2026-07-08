import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecitationMode } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRecitationSettingsDto {
  @ApiPropertyOptional({ enum: RecitationMode })
  @IsOptional()
  @IsEnum(RecitationMode)
  mode?: RecitationMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tajweedColorsOn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  highlightMistakes?: boolean;

  @ApiPropertyOptional({ example: 'ar.alafasy' })
  @IsOptional()
  @IsString()
  selectedReciter?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 114 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(114)
  currentSurah?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  currentAyah?: number;
}
