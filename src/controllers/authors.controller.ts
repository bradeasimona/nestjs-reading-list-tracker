import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthorsService } from '../services/authors.service';
import { CreateAuthorDto, UpdateAuthorDto } from '../dtos/author.dto';
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

  @Patch(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Author updated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found',
  })
  async updateAuthor(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.service.updateAuthor(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Author deleted' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found',
  })
  async deleteAuthor(@Param('id') id: string) {
    await this.service.deleteAuthor(id);
  }
}
