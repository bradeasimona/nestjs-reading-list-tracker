import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsRepository } from '../authors.repository';
import { CASSANDRA_CLIENT } from '../../modules/cassandra/cassandra.constants';
import { Client } from 'cassandra-driver';
import { AuthorEntity } from '../../entities/author.entity';

jest.mock('../../utils', () => ({
  checkCassandraConnection: jest.fn(),
}));

describe('AuthorsRepository', () => {
  let repository: AuthorsRepository;
  let cassandraClient: Client;

  const mockMapper = {
    insert: jest.fn(),
    findAll: jest.fn(),
    get: jest.fn(),
  };

  const mockCassandraClient = {
    connect: jest.fn(),
    execute: jest.fn(),
  };

  const createAuthorEntity = (
    overrides?: Partial<AuthorEntity>,
  ): AuthorEntity =>
    new AuthorEntity({
      id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-19'),
      email: 'john.doe@test.com',
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
        AuthorsRepository,
        {
          provide: CASSANDRA_CLIENT,
          useValue: mockCassandraClient,
        },
      ],
    }).compile();

    repository = module.get<AuthorsRepository>(AuthorsRepository);
    cassandraClient = module.get<Client>(CASSANDRA_CLIENT);

    repository.onModuleInit();
  });

  describe('createAuthor', () => {
    it('should insert an author', async () => {
      const author = createAuthorEntity();

      await repository.createAuthor(author);

      expect(mockMapper.insert).toHaveBeenCalledWith(author);
    });
  });

  describe('findAllAuthors', () => {
    it('should return all authors', async () => {
      const authors = [
        createAuthorEntity({ id: 'k2d033de-f3ca-4092-84f7-f5761da6f04d' }),
        createAuthorEntity({ id: 'l8d033de-f3ca-4092-84f7-f5761da6f04d' }),
      ];

      mockMapper.findAll.mockResolvedValue({
        toArray: () => authors,
      });

      const result = await repository.findAllAuthors();

      expect(mockMapper.findAll).toHaveBeenCalled();
      expect(result).toBe(authors);
    });
  });

  describe('findAuthorById', () => {
    it('should get an author by id', async () => {
      const author = createAuthorEntity();

      mockMapper.get.mockResolvedValue(author);

      const result = await repository.findAuthorById(
        'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      );

      expect(mockMapper.get).toHaveBeenCalledWith({
        id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      });
      expect(result).toBe(author);
    });
  });

  describe('findAuthorByEmail', () => {
    it('should return author if email exists', async () => {
      mockCassandraClient.execute.mockResolvedValue({
        rowLength: 1,
        rows: [
          {
            get: (column: string) => {
              const data: any = {
                id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: new Date('1985-05-19'),
                email: 'john.doe@test.com',
                created_at: new Date(),
                updated_at: new Date(),
              };
              return data[column];
            },
          },
        ],
      });

      const result = await repository.findAuthorByEmail('john.doe@test.com');

      expect(mockCassandraClient.execute).toHaveBeenCalled();
      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result?.email).toBe('john.doe@test.com');
    });

    it('should return null if email does not exist', async () => {
      (mockCassandraClient.execute as jest.Mock).mockResolvedValue({
        rowLength: 0,
        rows: [],
      });

      const result = await repository.findAuthorByEmail('john@test.com');

      expect(result).toBeNull();
    });
  });
});
