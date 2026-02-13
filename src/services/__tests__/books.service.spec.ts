jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepository } from '../../repositories/books.repository';
import { BooksService } from '../../services/books.service';
import { CreateBookDto } from '../../dtos/book.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookEntity, BookStatus } from '../../entities/book.entity';

describe('BooksService', () => {
  let service: BooksService;
  let repo: BooksRepository;

  const mockBooksRepository = {
    createBook: jest.fn(),
    findAllBooks: jest.fn(),
    findBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BooksRepository,
          useValue: mockBooksRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repo = module.get<BooksRepository>(BooksRepository);
  });
  describe('createBook', () => {
    it('should create a book entity', () => {
      const dto: CreateBookDto = {
        title: 'Test',
        author: 'john doe',
        totalPages: 300,
      };

      service.createBook(dto);

      expect(repo.createBook).toHaveBeenCalled();
      const createdBook = mockBooksRepository.createBook.mock.calls[0][0];
      expect(createdBook).toBeInstanceOf(BookEntity);
      expect(createdBook.title).toBe(dto.title);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', () => {
      service.findAllBooks();

      expect(repo.findAllBooks).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a book if found', async () => {
      const book = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'john doe',
        totalPages: 100,
        currentPage: 0,
        status: BookStatus.READING,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById.mockResolvedValue(book);

      const result = await service.findOne('1');

      expect(result).toBe(book);
    });

    it('should throw NotFoundException if book is not found', async () => {
      mockBooksRepository.findBookById.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('should throw NotFoundException if the book was not found', async () => {
      mockBooksRepository.findBookById.mockResolvedValue(null);

      await expect(service.updateBook('1', { title: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if currentPage is decreased', async () => {
      const existingBook = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John Doe',
        totalPages: 100,
        currentPage: 50,
        status: BookStatus.READING,
        progress: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById.mockResolvedValue(existingBook);

      await expect(
        service.updateBook('1', { currentPage: 40 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if currentPage exceeds totalPages', async () => {
      const existingBook = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John Doe',
        totalPages: 100,
        currentPage: 50,
        status: BookStatus.READING,
        progress: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById.mockResolvedValue(existingBook);

      await expect(
        service.updateBook('1', { currentPage: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should only update title without recalculating progress', async () => {
      const existingBook = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John',
        totalPages: 100,
        currentPage: 50,
        status: BookStatus.READING,
        progress: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById
        .mockResolvedValueOnce(existingBook)
        .mockResolvedValueOnce({ ...existingBook, title: 'New Test' });

      await service.updateBook('1', { title: 'New Test' });

      expect(mockBooksRepository.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'New Test',
        }),
      );
    });

    it('should calculate progress and set status to READING', async () => {
      const existingBook = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John Doe',
        totalPages: 100,
        currentPage: 20,
        status: BookStatus.READING,
        progress: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById
        .mockResolvedValueOnce(existingBook)
        .mockResolvedValueOnce(existingBook);

      await service.updateBook('1', { currentPage: 50 });

      expect(mockBooksRepository.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          progress: 50,
          status: BookStatus.READING,
        }),
      );
    });

    it('should set status to FINISHED when currentPage equals totalPages', async () => {
      const existingBook = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John Doe',
        totalPages: 100,
        currentPage: 90,
        status: BookStatus.READING,
        progress: 90,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById
        .mockResolvedValueOnce(existingBook)
        .mockResolvedValueOnce(existingBook);

      await service.updateBook('1', { currentPage: 100 });

      expect(mockBooksRepository.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          progress: 100,
          status: BookStatus.FINISHED,
        }),
      );
    });
  });

  describe('deleteBook', () => {
    it('should delete book if it exists', async () => {
      const book = new BookEntity({
        id: '1',
        title: 'Test',
        author: 'John Doe',
        totalPages: 100,
        currentPage: 0,
        status: BookStatus.NOT_STARTED,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBooksRepository.findBookById.mockResolvedValue(book);

      await service.deleteBook('1');

      expect(mockBooksRepository.deleteBook).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if book does not exist', async () => {
      mockBooksRepository.findBookById.mockResolvedValue(null);

      await expect(service.deleteBook('1')).rejects.toThrow(NotFoundException);
    });
  });
});
