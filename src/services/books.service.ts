import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BooksRepository } from '../repositories/books.repository';
import { CreateBookDto, UpdateBookDto } from '../dtos/book.dto';
import { BookEntity, BookStatus } from '../entities/book.entity';
import { v4 } from 'uuid';

@Injectable()
export class BooksService {
  constructor(private readonly repo: BooksRepository) {}

  async createBook(dto: CreateBookDto) {
    const book = new BookEntity({
      id: v4(),
      title: dto.title,
      author: dto.author,
      totalPages: dto.totalPages,
      currentPage: 0,
      status: BookStatus.NOT_STARTED,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.createBook(book);
  }

  async findAllBooks() {
    return this.repo.findAllBooks();
  }

  async findOne(id: string) {
    const book = await this.repo.findBookById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async updateBook(id: string, dto: UpdateBookDto) {
    const existingBook = await this.repo.findBookById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    const finalTotalPages = dto.totalPages ?? existingBook.totalPages;

    if (
      dto.totalPages !== undefined &&
      dto.totalPages < existingBook.currentPage
    ) {
      throw new BadRequestException(
        'Total pages cannot be less than current page',
      );
    }

    const updatedBookDetails: Partial<BookEntity> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.currentPage !== undefined) {
      this.validateDecreaseCurrentPage(
        dto.currentPage,
        existingBook.currentPage,
      );
      this.validateCurrentPageLimit(dto.currentPage, finalTotalPages);

      const { progress, status } = this.calculateProgressAndStatus(
        dto.currentPage,
        finalTotalPages,
      );

      updatedBookDetails.progress = progress;
      updatedBookDetails.status = status;
    }

    const updatedBook = new BookEntity({
      ...existingBook,
      ...updatedBookDetails,
    });

    await this.repo.updateBook(id, updatedBookDetails);

    return updatedBook;
  }

  async deleteBook(id: string) {
    const existingBook = await this.repo.findBookById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    await this.repo.deleteBook(id);
  }

  private validateDecreaseCurrentPage(
    newCurrentPage: number,
    currentPage: number,
  ) {
    if (newCurrentPage !== 0 && newCurrentPage < currentPage) {
      throw new BadRequestException('Cannot decrease current page');
    }
  }

  private validateCurrentPageLimit(newCurrentPage: number, totalPages: number) {
    if (newCurrentPage > totalPages) {
      throw new BadRequestException('Current page cannot exceed total pages');
    }
  }

  private calculateProgressAndStatus(
    newCurrentPage: number,
    totalPages: number,
  ) {
    const progress = Math.round((newCurrentPage / totalPages) * 100);

    let status: BookStatus;

    if (newCurrentPage === 0) {
      status = BookStatus.NOT_STARTED;
    } else if (newCurrentPage >= totalPages) {
      status = BookStatus.FINISHED;
    } else {
      status = BookStatus.READING;
    }

    return { progress, status };
  }
}
