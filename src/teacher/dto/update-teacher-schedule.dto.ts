import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateTeacherScheduleDto {
  @ApiProperty({ example: ['morning', 'evening'] })
  @IsArray()
  @IsString({ each: true })
  timeslotSlugs: string[];

  @ApiProperty({ required: false, example: 'Asia/Karachi' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
