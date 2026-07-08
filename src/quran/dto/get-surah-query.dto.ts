import { IsOptional, IsString } from 'class-validator';

export class GetSurahQueryDto {
  @IsOptional()
  @IsString()
  translation?: string;

  @IsOptional()
  @IsString()
  reciter?: string;
}
