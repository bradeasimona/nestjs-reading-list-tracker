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
    execute: jest.fn(),
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

  describe('findBookByIsbn', () => {
    it('should return book id if isbn exists', async () => {
      mockCassandraClient.execute.mockResolvedValue({
        rowLength: 1,
        rows: [
          {
            get: (column: string) => {
              const data: any = {
                id: '2288421b-3de3-4431-8f41-145766da4f3b',
                isbn: '9783161484104',
                title: 'Test',
                author_id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
                total_pages: 100,
                current_page: 0,
                progress: 0,
                status: BookStatus.NOT_STARTED,
                created_at: new Date(),
                updated_at: new Date(),
              };
              return data[column];
            },
          },
        ],
      });

      const result = await repository.findBookByIsbn('9783161484104');

      expect(mockCassandraClient.execute).toHaveBeenCalled();
      expect(result).toBeInstanceOf(BookEntity);
      expect(result?.isbn).toBe('9783161484104');
    });

    it('should return null if isbn does not exist', async () => {
      mockCassandraClient.execute.mockResolvedValue({
        rowLength: 0,
        rows: [],
      });

      const result = await repository.findBookByIsbn('9783161484104');

      expect(result).toBeNull();
    });
  });

  describe('findBooksByAuthorId', () => {
    it('should return books for given authorId', async () => {
      const authorId = 'c1d033de-f3ca-4092-84f7-f5761da6f04d';

      mockCassandraClient.execute.mockResolvedValue({
        rowLength: 2,
        rows: [
          {
            get: (column: string) => {
              const data: any = {
                id: '1',
                isbn: '9783161484104',
                title: 'Book 1',
                author_id: authorId,
                total_pages: 100,
                current_page: 10,
                progress: 10,
                status: BookStatus.NOT_STARTED,
                created_at: new Date(),
                updated_at: new Date(),
              };
              return data[column];
            },
          },
          {
            get: (column: string) => {
              const data: any = {
                id: '2',
                isbn: '9783161484105',
                title: 'Book 2',
                author_id: authorId,
                total_pages: 200,
                current_page: 20,
                progress: 10,
                status: BookStatus.NOT_STARTED,
                created_at: new Date(),
                updated_at: new Date(),
              };
              return data[column];
            },
          },
        ],
      });

      const result = await repository.findBooksByAuthorId(authorId);

      expect(mockCassandraClient.execute).toHaveBeenCalledWith(
        `SELECT * FROM reading_list_tracker.books WHERE author_id = ?`,
        [authorId],
        { prepare: true },
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BookEntity);
      expect(result[0].authorId).toBe(authorId);
    });

    it('should return empty array if author has no books', async () => {
      const authorId = 'c1d033de-f3ca-4092-84f7-f5761da6f04d';

      mockCassandraClient.execute.mockResolvedValue({
        rowLength: 0,
        rows: [],
      });

      const result = await repository.findBooksByAuthorId(authorId);

      expect(result).toEqual([]);
    });
  });
});
