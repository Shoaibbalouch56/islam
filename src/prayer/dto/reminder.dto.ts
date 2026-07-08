import { AlarmSound, Prayer } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
} from 'class-validator';

const ALLOWED_OFFSETS = [0, 5, 10, 15, 30];

export class UpsertReminderDto {
  @IsEnum(Prayer)
  prayer: Prayer;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @IsIn(ALLOWED_OFFSETS)
  offsetMinutes?: number;

  @IsOptional()
  @IsEnum(AlarmSound)
  alarmSound?: AlarmSound;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @IsIn(ALLOWED_OFFSETS)
  offsetMinutes?: number;

  @IsOptional()
  @IsEnum(AlarmSound)
  alarmSound?: AlarmSound;
}
