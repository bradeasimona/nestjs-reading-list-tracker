import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, mapping } from 'cassandra-driver';
import { CASSANDRA_CLIENT } from '../modules/cassandra/cassandra.constants';
import { BookEntity } from '../entities/book.entity';
import { checkCassandraConnection } from '../utils';

@Injectable()
export class BooksRepository implements OnModuleInit {
  private bookMapper!: mapping.ModelMapper<BookEntity>;

  constructor(
    @Inject(CASSANDRA_CLIENT) private readonly cassandraClient: Client,
  ) {}

  createMapper<T>(mappingOptions: mapping.MappingOptions, modelName: string) {
    checkCassandraConnection(this.cassandraClient);
    return new mapping.Mapper(this.cassandraClient, mappingOptions).forModel<T>(
      modelName,
    );
  }

  onModuleInit() {
    const mappingOptions: mapping.MappingOptions = {
      models: {
        Book: {
          tables: ['books'],
          mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),
        },
      },
    };

    this.bookMapper = this.createMapper<BookEntity>(mappingOptions, 'Book');
  }

  async createBook(book: BookEntity) {
    await this.bookMapper.insert(book);
  }

  async findBookById(id: string) {
    return this.bookMapper.get({ id });
  }

  async findAllBooks(): Promise<BookEntity[]> {
    const books = await this.bookMapper.findAll();
    return books.toArray();
  }

  async updateBook(id: string, update: Partial<BookEntity>) {
    await this.bookMapper.update({
      id,
      ...update,
    });
  }

  async deleteBook(id: string) {
    await this.bookMapper.remove({ id });
  }
}
