import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from '../repositories/authors.repository';
import { CreateAuthorDto, UpdateAuthorDto } from '../dtos/author.dto';
import { AuthorEntity } from '../entities/author.entity';
import { v4 } from 'uuid';
@Injectable()
export class AuthorsService {
  constructor(private readonly repo: AuthorsRepository) {}

  async createAuthor(dto: CreateAuthorDto) {
    await this.checkIfEmailUnique(dto.email);

    const author = new AuthorEntity({
      id: v4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
      email: dto.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.createAuthor(author);
  }

  async findAllAuthors() {
    return this.repo.findAllAuthors();
  }

  async findAuthor(id: string) {
    const author = await this.repo.findAuthorById(id);
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async updateAuthor(id: string, dto: UpdateAuthorDto) {
    const existingAuthor = await this.repo.findAuthorById(id);

    if (!existingAuthor) {
      throw new NotFoundException('Author not found');
    }

    if (dto.email && dto.email !== existingAuthor.email) {
      await this.checkIfEmailUnique(dto.email);
    }

    const updatedAuthorDetails = this.mapUpdateAuthorDtoToEntity(dto);

    await this.repo.updateAuthor(id, updatedAuthorDetails);

    return new AuthorEntity({
      ...existingAuthor,
      ...updatedAuthorDetails,
    });
  }


  private async checkIfEmailUnique(email: string) {
    const existingEmail = await this.repo.findAuthorByEmail(email);

    if (existingEmail) {
      throw new BadRequestException('Author with this email already exists');
    }
  }

  private mapUpdateAuthorDtoToEntity( dto: UpdateAuthorDto ): Partial<AuthorEntity> {
    const update: Partial<AuthorEntity> = {
      updatedAt: new Date(),
    };

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'dateOfBirth') {
          update.dateOfBirth = new Date(value as string);
        } else {
          (update as any)[key] = value;
        }
      }
    });

    return update;
  }
}
