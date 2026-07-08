import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class AnalyzeRecitationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ayahNumber: number;

  @ApiPropertyOptional({ description: 'URL of uploaded student recording (optional for demo)' })
  @IsOptional()
  @IsString()
  @IsUrl()
  recordingUrl?: string;
}
