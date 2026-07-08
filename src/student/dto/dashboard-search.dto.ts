import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DashboardSearchDto {
  @ApiPropertyOptional({ description: 'Search courses by title or description' })
  @IsOptional()
  @IsString()
  q?: string;
}
