jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { AuthorEntity } from '../../entities/author.entity';
import { AuthorsRepository } from '../../repositories/authors.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from '../../services/authors.service';
import { CreateAuthorDto } from '../../dtos/author.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
      email: 'john.doe@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    const mockAuthorsRepository: jest.Mocked<AuthorsRepository> = {
      createAuthor: jest.fn(),
      findAllAuthors: jest.fn(),
      findAuthorById: jest.fn(),
      findAuthorByEmail: jest.fn(),
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
        email: 'john.doe@test.com',
      };
      
      repo.findAuthorByEmail.mockResolvedValue(null);
      repo.createAuthor.mockResolvedValue(undefined);

      await service.createAuthor(dto);

      expect(repo.createAuthor).toHaveBeenCalled();

      const createdAuthor = repo.createAuthor.mock.calls[0][0];

      expect(createdAuthor).toBeInstanceOf(AuthorEntity);
      expect(createdAuthor.id).toBe('mocked-uuid');
      expect(createdAuthor.firstName).toBe(dto.firstName);
      expect(createdAuthor.dateOfBirth).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException if email already exists', async () => {
      repo.findAuthorByEmail.mockResolvedValue(createAuthorEntity());

      const dto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-05-19',
        email: 'john.doe@test.com',
      };

      await expect(service.createAuthor(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repo.createAuthor).not.toHaveBeenCalled();
    });
  });

  describe('findAllAuthors', () => {
    it('should return all authors', async () => {
      const authors = [
        createAuthorEntity({ id: 'k2d033de-f3ca-4092-84f7-f5761da6f04d' }),
        createAuthorEntity({ id: 'l8d033de-f3ca-4092-84f7-f5761da6f04d' }),
      ];

      repo.findAllAuthors.mockResolvedValueOnce(authors);

      const result = await service.findAllAuthors();

      expect(repo.findAllAuthors).toHaveBeenCalled();
      expect(result).toBe(authors);
    });

    it('should return an empty array if no authors exist', async () => {
      repo.findAllAuthors.mockResolvedValueOnce([]);

      const result = await service.findAllAuthors();

      expect(result).toEqual([]);
    });
  });

  describe('findAuthor', () => {
    it('should return an author if found', async () => {
      const author = createAuthorEntity();

      repo.findAuthorById.mockResolvedValueOnce(author);

      const result = await service.findAuthor(
        'c1d033de-f3ca-4092-84f7-f5761da6f04d',
      );

      expect(result).toBe(author);
    });

    it('should throw NotFoundException if author is not found', async () => {
      repo.findAuthorById.mockResolvedValueOnce(null);

      await expect(
        service.findAuthor('c1d033de-f3ca-4092-84f7-f5761da6f04d'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
