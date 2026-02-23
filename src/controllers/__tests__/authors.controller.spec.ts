jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { AuthorsController } from '../authors.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthorsService } from '../../services/authors.service';
import { AuthorEntity } from '../../entities/author.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuthorDto } from '../../dtos/author.dto';

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
  });
});
