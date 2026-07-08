import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookmarkDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @IsInt()
  @Min(1)
  ayahNumber: number;

  @IsOptional()
  @IsString()
  surahName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
