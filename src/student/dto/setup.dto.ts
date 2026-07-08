import { IsOptional, IsString } from 'class-validator';

export class SetupDto {
  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
