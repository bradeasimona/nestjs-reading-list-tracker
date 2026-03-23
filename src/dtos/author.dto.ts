import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {
  @IsOptional()
  @IsEmail()
  email?: string;
}
