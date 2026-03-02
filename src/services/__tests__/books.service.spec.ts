jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepository } from '../../repositories/books.repository';
import { AuthorsRepository } from '../../repositories/authors.repository';
import { BooksService } from '../../services/books.service';
import { CreateBookDto } from '../../dtos/book.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookEntity, BookStatus } from '../../entities/book.entity';

describe('BooksService', () => {
  let service: BooksService;
  let repo: jest.Mocked<BooksRepository>;
  let authorsRepo: jest.Mocked<AuthorsRepository>;
  let dto: CreateBookDto;

  const createBookEntity = (overrides?: Partial<BookEntity>): BookEntity =>
    new BookEntity({
      isbn: '9783161484104',
      id: '2288421b-3de3-4431-8f41-145766da4f3b',
      title: 'Test',
      authorId: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
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
      findBookByIsbn: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
    } as any;

    const mockAuthorsRepository: jest.Mocked<AuthorsRepository> = {
      findAuthorById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BooksRepository,
          useValue: mockBooksRepository,
        },
        {
          provide: AuthorsRepository,
          useValue: mockAuthorsRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repo = module.get(BooksRepository);
    authorsRepo = module.get(AuthorsRepository);
    dto = {
      isbn: '9783161484104',
      title: 'Test',
      authorId: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      totalPages: 300,
    };

    jest.clearAllMocks();
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      repo.findBookByIsbn.mockResolvedValue(null);
      authorsRepo.findAuthorById.mockResolvedValue({} as any);
      repo.createBook.mockResolvedValue(undefined);

      await service.createBook(dto);

      expect(repo.createBook).toHaveBeenCalled();

      const createdBook = repo.createBook.mock.calls[0][0];

      expect(createdBook).toBeInstanceOf(BookEntity);
      expect(createdBook.id).toBe('mocked-uuid');
      expect(createdBook.title).toBe(dto.title);
      expect(createdBook.authorId).toBe(dto.authorId);
      expect(createdBook.totalPages).toBe(dto.totalPages);
    });

    it('should throw BadRequestException if ISBN already exists', async () => {
      repo.findBookByIsbn.mockResolvedValue(createBookEntity());

      await expect(service.createBook(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repo.createBook).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if author does not exist', async () => {
      repo.findBookByIsbn.mockResolvedValue(null);
      authorsRepo.findAuthorById.mockResolvedValue(null);

      await expect(service.createBook(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repo.createBook).not.toHaveBeenCalled();
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const books = [
        createBookEntity({ id: '2288421b-3de3-4431-8f41-145766da4f3b' }),
        createBookEntity({ id: '7288421b-3de3-4431-8f41-145766da4f3b' }),
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

      const result = await service.findOne(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );

      expect(result).toBe(book);
    });

    it('should throw NotFoundException if book is not found', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(
        service.findOne('2288421b-3de3-4431-8f41-145766da4f3b'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('should throw NotFoundException if the book was not found', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(
        service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
          title: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if currentPage is decreased', async () => {
      repo.findBookById.mockResolvedValueOnce(
        createBookEntity({ currentPage: 50 }),
      );

      await expect(
        service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
          currentPage: 40,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if currentPage exceeds totalPages', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await expect(
        service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
          currentPage: 150,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if totalPages is updated to be less than currentPage', async () => {
      repo.findBookById.mockResolvedValueOnce(
        createBookEntity({ currentPage: 90 }),
      );

      await expect(
        service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
          totalPages: 75,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should only update title without recalculating progress', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      const result = await service.updateBook(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        { title: 'New Test' },
      );

      expect(repo.updateBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        expect.objectContaining({
          title: 'New Test',
        }),
      );
      expect(result.progress).toBe(0);
      expect(result.status).toBe(BookStatus.NOT_STARTED);
    });

    it('should calculate progress and set status to READING', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
        currentPage: 50,
      });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        expect.objectContaining({
          progress: 50,
          status: BookStatus.READING,
        }),
      );
    });

    it('should set status to FINISHED when currentPage equals totalPages', async () => {
      repo.findBookById.mockResolvedValueOnce(createBookEntity());

      await service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
        currentPage: 100,
      });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        expect.objectContaining({
          progress: 100,
          status: BookStatus.FINISHED,
        }),
      );
    });

    it('should set status to NOT_STARTED when currentPage equals 0', async () => {
      repo.findBookById.mockResolvedValueOnce(
        createBookEntity({ currentPage: 90 }),
      );

      await service.updateBook('2288421b-3de3-4431-8f41-145766da4f3b', {
        currentPage: 0,
      });

      expect(repo.updateBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
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

      await service.deleteBook('2288421b-3de3-4431-8f41-145766da4f3b');

      expect(repo.deleteBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );

      expect(repo.deleteBook).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if book does not exist', async () => {
      repo.findBookById.mockResolvedValueOnce(null);

      await expect(
        service.deleteBook('2288421b-3de3-4431-8f41-145766da4f3b'),
      ).rejects.toThrow(NotFoundException);

      expect(repo.deleteBook).not.toHaveBeenCalled();
    });
  });
});
