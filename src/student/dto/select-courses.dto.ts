import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class SelectCoursesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  slugs: string[];
}
