jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { AuthorEntity } from '../../entities/author.entity';
import { AuthorsRepository } from '../../repositories/authors.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from '../authors.service';
import { CreateAuthorDto } from '../../dtos/author.dto';

describe('AuthorService', () => {
  let service: AuthorsService;
  let repo: jest.Mocked<AuthorsRepository>;

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
    const mockAuthorsRepository: jest.Mocked<AuthorsRepository> = {
      createAuthor: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: AuthorsRepository,
          useValue: mockAuthorsRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repo = module.get(AuthorsRepository);

    jest.clearAllMocks();
  });

  describe('createAuthor', () => {
    it('should create a new author', async () => {
      const dto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-05-19',
      };

      repo.createAuthor.mockResolvedValue(undefined);

      await service.createAuthor(dto);

      expect(repo.createAuthor).toHaveBeenCalled();

      const createdAuthor = repo.createAuthor.mock.calls[0][0];

      expect(createdAuthor).toBeInstanceOf(AuthorEntity);
      expect(createdAuthor.id).toBe('mocked-uuid');
      expect(createdAuthor.firstName).toBe(dto.firstName);
      expect(createdAuthor.dateOfBirth).toBeInstanceOf(Date);
    });
  });
});
