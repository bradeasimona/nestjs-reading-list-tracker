import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from '../repositories/authors.repository';
import { CreateAuthorDto } from '../dtos/author.dto';
import { AuthorEntity } from '../entities/author.entity';
import { v4 } from 'uuid';

@Injectable()
export class AuthorsService {
  constructor(private readonly repo: AuthorsRepository) {}

  async createAuthor(dto: CreateAuthorDto) {
    const author = new AuthorEntity({
      id: v4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
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
}
