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

  /*async updateBook(id: string, dto: UpdateBookDto) {
    const existingBook = await this.repo.findBookById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    const updatedBookDetails: Partial<BookEntity> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.currentPage !== undefined) {
      if (dto.currentPage > existingBook.totalPages) {
        throw new BadRequestException('Current page cannot exceed total pages');
      }
      const totalPages = dto.totalPages ?? existingBook.totalPages;
      const currentPage = dto.currentPage;

      const progress = Math.floor((currentPage / totalPages) * 100);

      updatedBookDetails.progress = progress;

      if (currentPage === 0) {
        updatedBookDetails.status = BookStatus.NOT_STARTED;
      } else if (currentPage >= totalPages) {
        updatedBookDetails.status = BookStatus.FINISHED;
      } else {
        updatedBookDetails.status = BookStatus.READING;
      }
    }

    await this.repo.updateBook(id, updatedBookDetails);

    return this.repo.findBookById(id);
  }*/

  async updateBook(id: string, dto: UpdateBookDto) {
    const existingBook = await this.repo.findBookById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    const updatedBookDetails: Partial<BookEntity> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.currentPage !== undefined) {
      this.validateCurrentPageUpdate(dto.currentPage, existingBook);

      const { progress, status } = this.calculateProgressAndStatus(
        dto.currentPage,
        dto.totalPages ?? existingBook.totalPages,
      );

      updatedBookDetails.progress = progress;
      updatedBookDetails.status = status;
    }

    await this.repo.updateBook(id, updatedBookDetails);

    return this.repo.findBookById(id);
  }

  private validateCurrentPageUpdate(
    newCurrentPage: number,
    existingBook: BookEntity,
  ) {
    if (newCurrentPage < existingBook.currentPage) {
      throw new BadRequestException('Cannot decrease current page');
    }

    if (newCurrentPage > existingBook.totalPages) {
      throw new BadRequestException('Current page cannot exceed total pages');
    }
  }

  private calculateProgressAndStatus(
    newCurrentPage: number,
    totalPages: number,
  ) {
    const progress = Math.floor((newCurrentPage / totalPages) * 100);

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
