import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from '../repositories/books.repository';
import { CreateBookDto } from '../dtos/create-book.dto';
import { BookEntity } from '../entities/book.entity';
import { v4 } from 'uuid';


@Injectable()
export class BooksService {
  constructor(private readonly repo: BooksRepository) {}

createBook(dto: CreateBookDto) {
  const book = new BookEntity({
    id: v4(),
    title: dto.title,
    author: dto.author,
    totalPages: dto.totalPages,
    currentPage: 0,
    status: 'READING',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return this.repo.createBook(book);
}


  findAllBooks() {
    return this.repo.findAllBooks();
  }

  async findOne(id: string) {
    const book = await this.repo.findBookById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }
}
