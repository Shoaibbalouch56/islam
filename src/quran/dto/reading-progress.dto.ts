import { IsInt, Max, Min } from 'class-validator';

export class ReadingProgressDto {
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber: number;

  @IsInt()
  @Min(1)
  ayahNumber: number;
}
