import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(13, 13)
  @Matches(/^\d+$/)
  isbn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsUUID()
  authorId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  totalPages: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;
}
