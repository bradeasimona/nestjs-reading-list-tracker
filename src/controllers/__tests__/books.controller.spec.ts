jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../books.controller';
import { BooksService } from '../../services/books.service';
import { CreateBookDto } from '../../dtos/book.dto';
import { BookEntity, BookStatus } from '../../entities/book.entity';

describe('BooksController', () => {
  let controller: BooksController;
  let service: DeepMocked<BooksService>;

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
    it('should create a book and return result', async () => {
      const dto: CreateBookDto = {
        title: 'Test',
        author: 'john doe',
        totalPages: 300,
      };

      const mockedResult = {
        id: 'mocked-id',
        title: dto.title,
        author: dto.author,
        totalPages: dto.totalPages,
      };

      service.createBook.mockResolvedValue(mockedResult as any);

      const result = await controller.createBook(dto);

      expect(service.createBook).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockedResult);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const mockedBooks: any = [
        new BookEntity({
          id: '1',
          title: 'Test1',
          author: 'john doe',
          totalPages: 300,
          currentPage: 10,
          status: BookStatus.READING,
          progress: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new BookEntity({
          id: '2',
          title: 'Test2',
          author: 'john doe',
          totalPages: 300,
          currentPage: 300,
          status: BookStatus.FINISHED,
          progress: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      service.findAllBooks.mockResolvedValue(mockedBooks);

      const result = await controller.findAllBooks();

      expect(service.findAllBooks).toHaveBeenCalled();
      expect(result).toBe(mockedBooks);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const mockedBook = {
        id: '1',
        title: 'Test',
        author: 'john doe',
        totalPages: 100,
        currentPage: 0,
        status: 'READING',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      service.findOne.mockResolvedValue(mockedBook);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toBe(mockedBook);
    });
  });

  describe('updateBook', () => {
    it('should call updateBook from service', async () => {
      const dto = { title: 'Test' };

      service.updateBook.mockResolvedValue({ id: '1', title: 'Test' } as any);

      const result = await controller.updateBook('1', dto as any);

      expect(service.updateBook).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual({ id: '1', title: 'Test' });
    });
  });

  describe('deleteBook', () => {
    it('should call deleteBook with the correct id', async () => {
      service.deleteBook.mockResolvedValue(undefined);

      await controller.deleteBook('1');

      expect(service.deleteBook).toHaveBeenCalledWith('1');
    });
  });
});
