import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Gender } from '@prisma/client';

export class PersonalDetailsDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
