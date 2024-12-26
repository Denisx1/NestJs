import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsArray()
  readonly photos?: string[]; // Список фотографий (опционально)
}
