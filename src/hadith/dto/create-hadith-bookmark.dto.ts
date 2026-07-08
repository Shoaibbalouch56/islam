import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHadithBookmarkDto {
  @IsString()
  @IsNotEmpty()
  hadithId: string;
}
