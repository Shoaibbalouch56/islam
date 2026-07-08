import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PAYMENT_METHOD_IDS } from '../student.constants';

export class CreateSubscriptionDto {
  @IsInt()
  planId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonSlugs?: string[];

  @IsOptional()
  @IsString()
  paymentMethod?: (typeof PAYMENT_METHOD_IDS)[number];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;
}
