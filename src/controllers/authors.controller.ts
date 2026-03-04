import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
} from '@nestjs/common';
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

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List of authors' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Authors not found',
  })
  async findAllAuthors() {
    return this.service.findAllAuthors();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Author found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found',
  })
  async findAuthor(@Param('id') id: string) {
    return this.service.findAuthor(id);
  }
}
