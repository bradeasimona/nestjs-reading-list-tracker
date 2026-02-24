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
  };

  const mockCassandraClient = {
    connect: jest.fn(),
  };

  const createAuthorEntity = (
    overrides?: Partial<AuthorEntity>,
  ): AuthorEntity =>
    new AuthorEntity({
      id: 'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-19'),
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
});
