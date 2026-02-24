import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthorsService } from '../services/authors.service';
import { CreateAuthorDto } from '../dtos/author.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly service: AuthorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Author successfully created',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async createAuthor(@Body() dto: CreateAuthorDto) {
    return this.service.createAuthor(dto);
  }
}
