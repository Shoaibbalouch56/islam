import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class SelectTimeslotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  slugs: string[];

  @IsOptional()
  @IsBoolean()
  smartScheduling?: boolean;
}
