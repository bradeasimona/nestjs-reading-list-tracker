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
  let repo: jest.Mocked<BooksRepository>;

  const createBookEntity = (overrides?: Partial<BookEntity>): BookEntity =>
    new BookEntity({
      id: '1',
      title: 'Test',
      author: 'John Doe',
      totalPages: 100,
      currentPage: 0,
      status: BookStatus.NOT_STARTED,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  beforeEach(async () => {    
    const mockBooksRepository: jest.Mocked<BooksRepository> = {
      createBook: jest.fn(),
      findAllBooks: jest.fn(),
      findBookById: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
    } as any;

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
    repo = module.get(BooksRepository);

    jest.clearAllMocks();
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      const dto: CreateBookDto = {
        title: 'Test',
        author: 'john doe',
        totalPages: 300,
      };

      await service.createBook(dto);

      expect(repo.createBook).toHaveBeenCalled();
      const createdBook = repo.createBook.mock.calls[0][0];
      expect(createdBook).toBeInstanceOf(BookEntity);
      expect(createdBook.title).toBe(dto.title);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const books = [
        createBookEntity({ id: '1' }),
        createBookEntity({ id: '2' }),
      ];

      repo.findAllBooks.mockResolvedValueOnce(books);

      const result = await service.findAllBooks();

      expect(repo.findAllBooks).toHaveBeenCalled();
      expect(result).toBe(books);
    });

    it('should return an empty arrray if no books exist', async () => {
      repo.findAllBooks.mockResolvedValueOnce([]);

      const result = await service.findAllBooks();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a book if found', async () => {
      const book = createBookEntity();

      repo.findBookById.mockResolvedValueOnce(book);

      const result = await service.findOne('1');

      expect(result).toBe(book);
    });

    it('should throw NotFoundException if book is not found', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('should throw NotFoundException if the book was not found', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(service.updateBook('1', { title: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if currentPage is decreased', async () => {
      repo.findBookById.mockResolvedValueOnce(
        createBookEntity({ currentPage: 50 }),
      );

      await expect(
        service.updateBook('1', { currentPage: 40 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if currentPage exceeds totalPages', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await expect(
        service.updateBook('1', { currentPage: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if totalPages is updated to be less than currentPage', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity({ currentPage: 90 }));

      await expect(
        service.updateBook('1', { totalPages: 75 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should only update title without recalculating progress', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      const result = await service.updateBook('1', { title: 'New Test' });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'New Test',
        }),
      );
      expect(result.progress).toBe(0);
      expect(result.status).toBe(BookStatus.NOT_STARTED);

    });

    it('should calculate progress and set status to READING', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await service.updateBook('1', { currentPage: 50 });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          progress: 50,
          status: BookStatus.READING,
        }),
      );
    });

    it('should set status to FINISHED when currentPage equals totalPages', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await service.updateBook('1', { currentPage: 100 });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          progress: 100,
          status: BookStatus.FINISHED,
        }),
      );
    });

    it('should set status to NOT_STARTED when currentPage equals 0', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity({ currentPage: 90 }))

      await service.updateBook('1', { currentPage: 0 });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          progress: 0,
          status: BookStatus.NOT_STARTED,
        }),
      );
    });
  });

  describe('deleteBook', () => {
    it('should delete book if it exists', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await service.deleteBook('1');

      expect(repo.deleteBook).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if book does not exist', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(service.deleteBook('1')).rejects.toThrow(NotFoundException);
    });
  });
});
