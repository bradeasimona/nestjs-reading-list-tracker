import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto, UpdateBookDto } from '../dtos/book.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book successfully created',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async createBook(@Body() dto: CreateBookDto) {
    return this.service.createBook(dto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List of books' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Books not found' })
  async findAllBooks() {
    return this.service.findAllBooks();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Book found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Book updated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Patch(':id')
  async updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.service.updateBook(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Book deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  async deleteBook(@Param('id') id: string) {
    await this.service.deleteBook(id);
  }
}
