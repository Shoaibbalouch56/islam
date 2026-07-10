import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  planId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonSlugs?: string[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;
}
