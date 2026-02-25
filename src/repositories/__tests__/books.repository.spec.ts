import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepository } from '../books.repository';
import { CASSANDRA_CLIENT } from '../../modules/cassandra/cassandra.constants';
import { Client } from 'cassandra-driver';
import { BookEntity, BookStatus } from '../../entities/book.entity';

jest.mock('../../utils', () => ({
  checkCassandraConnection: jest.fn(),
}));

describe('BooksRepository', () => {
  let repository: BooksRepository;
  let cassandraClient: Client;

  const mockMapper = {
    insert: jest.fn(),
    get: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCassandraClient = {
    connect: jest.fn(),
  };

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
    jest.clearAllMocks();

    jest
      .spyOn(require('cassandra-driver').mapping, 'Mapper')
      .mockImplementation(() => ({
        forModel: () => mockMapper,
      }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksRepository,
        {
          provide: CASSANDRA_CLIENT,
          useValue: mockCassandraClient,
        },
      ],
    }).compile();

    repository = module.get<BooksRepository>(BooksRepository);
    cassandraClient = module.get<Client>(CASSANDRA_CLIENT);

    repository.onModuleInit();
  });

  describe('createBook', () => {
    it('should insert a book', async () => {
      const book = createBookEntity();

      await repository.createBook(book);

      expect(mockMapper.insert).toHaveBeenCalledWith(book);
    });
  });

  describe('findBookById', () => {
    it('should get a book by id', async () => {
      const book = createBookEntity();

      mockMapper.get.mockResolvedValue(book);

      const result = await repository.findBookById(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );

      expect(mockMapper.get).toHaveBeenCalledWith({
        id: '2288421b-3de3-4431-8f41-145766da4f3b',
      });
      expect(result).toBe(book);
    });
  });

  describe('findBookByIsbn', () => {
    it('should get a book by isbn', async () => {
      const book = createBookEntity();

      mockMapper.get.mockResolvedValue(book);

      const result = await repository.findBookByIsbn(
        '9783161484104',
      );

      expect(mockMapper.get).toHaveBeenCalledWith({
        isbn: '9783161484104',
      });
      expect(result).toBe(book);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const books = [
        createBookEntity(),
        createBookEntity({ id: '7288421b-3de3-4431-8f41-145766da4f3b' }),
      ];

      mockMapper.findAll.mockResolvedValue({
        toArray: () => books,
      });

      const result = await repository.findAllBooks();

      expect(mockMapper.findAll).toHaveBeenCalled();
      expect(result).toBe(books);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const update = { title: 'Test - updated' };

      await repository.updateBook(
        '2288421b-3de3-4431-8f41-145766da4f3b',
        update,
      );

      expect(mockMapper.update).toHaveBeenCalledWith({
        id: '2288421b-3de3-4431-8f41-145766da4f3b',
        ...update,
      });
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      await repository.deleteBook('2288421b-3de3-4431-8f41-145766da4f3b');

      expect(mockMapper.remove).toHaveBeenCalledWith({
        id: '2288421b-3de3-4431-8f41-145766da4f3b',
      });
    });
  });
});
