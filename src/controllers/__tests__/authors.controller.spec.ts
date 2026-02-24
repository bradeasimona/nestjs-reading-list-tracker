jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { AuthorsController } from '../authors.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthorsService } from '../../services/authors.service';
import { AuthorEntity } from '../../entities/author.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuthorDto } from '../../dtos/author.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: DeepMocked<AuthorsService>;

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
    service = createMock<AuthorsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  describe('createAuthor', () => {
    it('should create an author and return result', async () => {
      const dto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-05-19',
      };

      const mockedResult = createAuthorEntity();

      service.createAuthor.mockResolvedValue(mockedResult as any);

      const result = await controller.createAuthor(dto);

      expect(service.createAuthor).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockedResult);
    });

    it('should throw BadRequestException', async () => {
      const dto = {} as any;

      service.createAuthor.mockRejectedValue(new BadRequestException());

      await expect(controller.createAuthor(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllAuthors', () => {
    it('should return all authors', async () => {
      const mockedAuthors: AuthorEntity[] = [
        createAuthorEntity({
          id: 'k2d033de-f3ca-4092-84f7-f5761da6f04d',
        }),
        createAuthorEntity({
          id: 'l8d033de-f3ca-4092-84f7-f5761da6f04d',
        }),
      ];

      service.findAllAuthors.mockResolvedValue(mockedAuthors);

      const result = await controller.findAllAuthors();

      expect(service.findAllAuthors).toHaveBeenCalled();
      expect(result).toBe(mockedAuthors);
    });

    it('should return empty array if no authors exist', async () => {
      service.findAllAuthors.mockResolvedValue([]);

      const result = await controller.findAllAuthors();

      expect(result).toEqual([]);
    });
  });

  describe('findAuthor', () => {
    it('should return an author by id', async () => {
      const mockedAuthor = createAuthorEntity();

      service.findAuthor.mockResolvedValue(mockedAuthor);

      const result = await controller.findAuthor(
        'l8d033de-f3ca-4092-84f7-f5761da6f04d',
      );

      expect(service.findAuthor).toHaveBeenCalledWith(
        'l8d033de-f3ca-4092-84f7-f5761da6f04d',
      );
      expect(result).toBe(mockedAuthor);
    });

    it('should throw NotFoundException', async () => {
      service.findAuthor.mockRejectedValue(new NotFoundException());

      await expect(
        controller.findAuthor('l8d033de-f3ca-4092-84f7-f5761da6f04d'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
