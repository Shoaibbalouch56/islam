import { Type } from 'class-transformer';
import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';

export const CALCULATION_METHODS = [
  'MuslimWorldLeague',
  'Egyptian',
  'Karachi',
  'UmmAlQura',
  'Dubai',
  'Qatar',
  'Kuwait',
  'MoonsightingCommittee',
  'Singapore',
  'Turkey',
  'Tehran',
  'NorthAmerica',
] as const;

export type CalculationMethodName = (typeof CALCULATION_METHODS)[number];

export class GetPrayerTimesDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(CALCULATION_METHODS)
  method?: CalculationMethodName;

  @IsOptional()
  @IsIn(['shafi', 'hanafi'])
  madhab?: 'shafi' | 'hanafi';

  @IsOptional()
  @IsString()
  timezone?: string;
}
