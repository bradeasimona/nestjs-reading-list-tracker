import {
  Body,
  Controller,
  Get,
  Post,
  Version,
  Param
} from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dtos/create-book.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Version('1')
  @Post()
  createBook(@Body() dto: CreateBookDto) {
    return this.service.createBook(dto);
  }

  @Version('1')
  @Get()
  findAllBooks() {
    return this.service.findAllBooks();
  }

  @Version('1')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
