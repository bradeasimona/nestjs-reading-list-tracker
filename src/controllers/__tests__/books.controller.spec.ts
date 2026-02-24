jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../books.controller';
import { BooksService } from '../../services/books.service';
import { CreateBookDto } from '../../dtos/book.dto';
import { BookEntity, BookStatus } from '../../entities/book.entity';
import { NotFoundException } from '@nestjs/common';

describe('BooksController', () => {
  let controller: BooksController;
  let service: DeepMocked<BooksService>;

  const createBookEntity = (overrides?: Partial<BookEntity>): BookEntity =>
    new BookEntity({
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
    service = createMock<BooksService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  describe('createBook', () => {
    it('should create a book and return the result', async () => {
      const dto: CreateBookDto = {
        title: 'Test',
        authorId: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
        totalPages: 300,
      };

      const mockedResult = createBookEntity();

      service.createBook.mockResolvedValue(mockedResult as any);

      const result = await controller.createBook(dto);

      expect(service.createBook).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockedResult);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const mockedBooks: BookEntity[] = [
        createBookEntity({
          id: '2288421b-3de3-4431-8f41-145766da4f3b',
          status: BookStatus.READING,
        }),
        createBookEntity({
          id: '7288421b-3de3-4431-8f41-145766da4f3b',
          status: BookStatus.FINISHED,
        }),
      ];

      service.findAllBooks.mockResolvedValue(mockedBooks);

      const result = await controller.findAllBooks();

      expect(service.findAllBooks).toHaveBeenCalled();
      expect(result).toBe(mockedBooks);
    });

    it('should return empty array if no books exist', async () => {
      service.findAllBooks.mockResolvedValue([]);

      const result = await controller.findAllBooks();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const mockedBook = createBookEntity();

      service.findOne.mockResolvedValue(mockedBook);

      const result = await controller.findOne(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );

      expect(service.findOne).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );
      expect(result).toBe(mockedBook);
    });

    it('should throw NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.findOne('2288421b-3de3-4431-8f41-145766da4f3b'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('should call updateBook from service', async () => {
      const dto = { title: 'Test - updated' };
      const updatedBook = createBookEntity();

      service.updateBook.mockResolvedValue(updatedBook);

      const result = await controller.updateBook(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        dto,
      );

      expect(service.updateBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        dto,
      );
      expect(result).toBe(updatedBook);
    });
  });

  describe('deleteBook', () => {
    it('should call deleteBook with the correct id', async () => {
      service.deleteBook.mockResolvedValue(undefined);

      await controller.deleteBook('2288421b-3de3-4431-8f41-145766da4f3b');

      expect(service.deleteBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );
    });
  });
});
