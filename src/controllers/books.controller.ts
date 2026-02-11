import { Body, Controller, Get, Post, Param, HttpStatus } from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dtos/create-book.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.OK, description: 'Book successfully created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  createBook(@Body() dto: CreateBookDto) {
    return this.service.createBook(dto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List of books' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Books not found' })
  findAllBooks() {
    return this.service.findAllBooks();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Book found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
