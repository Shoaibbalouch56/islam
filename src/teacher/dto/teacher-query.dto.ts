import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TeacherDashboardQueryDto {
  @ApiPropertyOptional({ description: 'Search classes or students' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class TeacherClassesQueryDto {
  @ApiPropertyOptional({
    enum: ['all', 'pending', 'completed', 'upcoming'],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  status?: 'all' | 'pending' | 'completed' | 'upcoming';
}
