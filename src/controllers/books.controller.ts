import {
  Body,
  Controller,
  Get,
  Post,
  Param
} from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dtos/create-book.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Post()
  createBook(@Body() dto: CreateBookDto) {
    return this.service.createBook(dto);
  }

  @Get()
  findAllBooks() {
    return this.service.findAllBooks();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
