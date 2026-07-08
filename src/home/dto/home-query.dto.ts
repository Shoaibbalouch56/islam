import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { CALCULATION_METHODS } from '../../prayer/dto/get-prayer-times.dto';
import type { CalculationMethodName } from '../../prayer/dto/get-prayer-times.dto';

export class HomeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

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
