jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepository } from '../../repositories/books.repository';
import { BooksService } from '../../services/books.service';
import { CreateBookDto } from '../../dtos/create-book.dto';
import { NotFoundException } from '@nestjs/common';
import { BookEntity } from '../../entities/book.entity';

describe('BooksService', () => {
  let service: BooksService;
  let repo: BooksRepository;

  const mockBooksRepository = {
    createBook: jest.fn(),
    findAllBooks: jest.fn(),
    findBookById: jest.fn(),
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

  it('should return all books', () => {
    service.findAllBooks();

    expect(repo.findAllBooks).toHaveBeenCalled();
  });

  it('should return a book if found', async () => {
    const book = new BookEntity({
      id: '1',
      title: 'Test',
      author: 'john doe',
      totalPages: 100,
      currentPage: 0,
      status: 'READING',
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
