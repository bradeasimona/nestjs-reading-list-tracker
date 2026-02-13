import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepository } from '../books.repository';
import { CASSANDRA_CLIENT } from '../../modules/cassandra/cassandra.constants';
import { Client } from 'cassandra-driver';
import { BookEntity } from '../../entities/book.entity';

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

  beforeEach(async () => {
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
    it('should insert a book - test for ', async () => {
      const book = {} as BookEntity;

      await repository.createBook(book);

      expect(mockMapper.insert).toHaveBeenCalledWith(book);
    });
  });

  describe('findOne', () => {
    it('should get a book by id', async () => {
      const book = {} as BookEntity;

      mockMapper.get.mockResolvedValue(book);

      const result = await repository.findBookById('1');

      expect(result).toBe(book);
    });
  });

  describe('findAllBooks', () => {
    it('should return all books', async () => {
      const books = [{} as BookEntity];

      mockMapper.findAll.mockResolvedValue({
        toArray: () => books,
      });

      const result = await repository.findAllBooks();

      expect(result).toBe(books);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const update = { title: 'Test' };

      await repository.updateBook('1', update);

      expect(mockMapper.update).toHaveBeenCalledWith({
        id: '1',
        ...update,
      });
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      await repository.deleteBook('1');

      expect(mockMapper.remove).toHaveBeenCalledWith({ id: '1' });
    });
  });
});
