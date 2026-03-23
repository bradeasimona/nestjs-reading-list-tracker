jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { AuthorEntity } from '../../entities/author.entity';
import { AuthorsRepository } from '../../repositories/authors.repository';
import { BooksRepository } from '../../repositories/books.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from '../../services/authors.service';
import { CreateAuthorDto } from '../../dtos/author.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthorService', () => {
  let service: AuthorsService;
  let repo: jest.Mocked<AuthorsRepository>;
  let booksRepo: jest.Mocked<BooksRepository>;

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
      updateAuthor: jest.fn(),
      deleteAuthor: jest.fn(),
    } as any;

    const mockBooksRepository: jest.Mocked<BooksRepository> = {
      findBookById: jest.fn(),
      findBooksByAuthorId: jest.fn(),
      deleteBook: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: AuthorsRepository,
          useValue: mockAuthorsRepository,
        },
        {
          provide: BooksRepository,
          useValue: mockBooksRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repo = module.get(AuthorsRepository);
    booksRepo = module.get(BooksRepository);

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

  describe('updateAuthor', () => {
    it('should update an existing author', async () => {
      const existingAuthor = createAuthorEntity();
      const updatedDetails = {
        firstName: 'Jane',
        email: 'jane.doe@test.com',
      };

      repo.findAuthorById.mockResolvedValueOnce(existingAuthor);
      repo.findAuthorByEmail.mockResolvedValueOnce(null);
      repo.updateAuthor.mockResolvedValueOnce(undefined);

      const result = await service.updateAuthor(
        existingAuthor.id,
        updatedDetails,
      );

      expect(repo.updateAuthor).toHaveBeenCalledWith(
        existingAuthor.id,
        expect.objectContaining(updatedDetails),
      );
      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result.firstName).toBe(updatedDetails.firstName);
      expect(result.email).toBe(updatedDetails.email);
    });

    it('should update dateOfBirth correctly', async () => {
      const existingDateOfBirth = createAuthorEntity({
        dateOfBirth: new Date('1985-05-19'),
      });

      repo.findAuthorById.mockResolvedValue(existingDateOfBirth);
      repo.updateAuthor.mockResolvedValue(undefined);

      const newDate = '1990-10-10';

      const result = await service.updateAuthor(existingDateOfBirth.id, {
        dateOfBirth: newDate,
      });

      expect(repo.updateAuthor).toHaveBeenCalledWith(
        existingDateOfBirth.id,
        expect.objectContaining({
          dateOfBirth: new Date(newDate),
        }),
      );

      expect(result.dateOfBirth).toEqual(new Date(newDate));
    });

    it('should ignore undefined values in update payload', async () => {
      const existingAuthor = createAuthorEntity();

      repo.findAuthorById.mockResolvedValue(existingAuthor);
      repo.updateAuthor.mockResolvedValue(undefined);

      const result = await service.updateAuthor(existingAuthor.id, {
        firstName: undefined,
      });

      expect(repo.updateAuthor).toHaveBeenCalledWith(
        existingAuthor.id,
        expect.not.objectContaining({
          firstName: undefined,
        }),
      );

      expect(result.firstName).toBe(existingAuthor.firstName);
    });

    it('should throw NotFoundException if author to update is not found', async () => {
      repo.findAuthorById.mockResolvedValueOnce(null);

      await expect(
        service.updateAuthor('c1d033de-f3ca-4092-84f7-f5761da6f04d', {
          firstName: 'Jane',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new email is already in use', async () => {
      const existingAuthor = createAuthorEntity();
      const anotherAuthorWithSameEmail = createAuthorEntity({
        id: 'd2d033de-f3ca-4092-84f7-f5761da6f04d',
      });

      repo.findAuthorById.mockResolvedValueOnce(existingAuthor);
      repo.findAuthorByEmail.mockResolvedValueOnce(anotherAuthorWithSameEmail);

      await expect(
        service.updateAuthor(existingAuthor.id, { email: 'jane.doe@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAuthor', () => {
    it('should throw NotFoundException if author does not exist', async () => {
      repo.findAuthorById.mockResolvedValueOnce(null);

      await expect(
        service.deleteAuthor('c1d033de-f3ca-4092-84f7-f5761da6f04d'),
      ).rejects.toThrow(NotFoundException);

      expect(repo.deleteAuthor).not.toHaveBeenCalled();
    });

    it('should delete all books of the author and then delete the author', async () => {
      const author = createAuthorEntity();

      const books = [
        { id: '2288421b-3de3-4431-8f41-145766da4f3b' },
        { id: '7288421b-3de3-4431-8f41-145766da4f3b' },
      ] as any;

      repo.findAuthorById.mockResolvedValueOnce(author);
      booksRepo.findBooksByAuthorId.mockResolvedValueOnce(books);
      booksRepo.deleteBook.mockResolvedValue(undefined);
      repo.deleteAuthor.mockResolvedValue(undefined);

      await service.deleteAuthor(author.id);

      expect(booksRepo.findBooksByAuthorId).toHaveBeenCalledWith(author.id);

      expect(booksRepo.deleteBook).toHaveBeenCalledTimes(2);
      expect(booksRepo.deleteBook).toHaveBeenCalledWith(
        '2288421b-3de3-4431-8f41-145766da4f3b',
      );
      expect(booksRepo.deleteBook).toHaveBeenCalledWith(
        '7288421b-3de3-4431-8f41-145766da4f3b',
      );

      expect(repo.deleteAuthor).toHaveBeenCalledWith(author.id);
    });

    it('should delete author if no books exist', async () => {
      const author = createAuthorEntity();

      repo.findAuthorById.mockResolvedValueOnce(author);
      booksRepo.findBooksByAuthorId.mockResolvedValueOnce([]);
      repo.deleteAuthor.mockResolvedValueOnce(undefined);

      await service.deleteAuthor(author.id);

      expect(booksRepo.deleteBook).not.toHaveBeenCalled();
      expect(repo.deleteAuthor).toHaveBeenCalledWith(author.id);
    });
  });
});
