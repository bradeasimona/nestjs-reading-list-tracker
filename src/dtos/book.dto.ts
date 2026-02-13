import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @Min(1)
  totalPages: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsInt()
  @Min(0)
  currentPage?: number;
}
