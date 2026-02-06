import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, mapping } from 'cassandra-driver';
import { CASSANDRA_CLIENT } from '../modules/cassandra/cassandra.constants';
import { BookEntity } from '../entities/book.entity';
import { checkCassandraConnection } from '../utils';

@Injectable()
export class BooksRepository implements OnModuleInit{
  private bookMapper!: mapping.ModelMapper<BookEntity>

  constructor(@Inject(CASSANDRA_CLIENT) private readonly cassandraClient: Client) {}

  createMapper<T>(mappingOptions: mapping.MappingOptions, modelName: string) {
    checkCassandraConnection(this.cassandraClient);
    return new mapping.Mapper(this.cassandraClient, mappingOptions).forModel<T>(modelName);
  }

  onModuleInit() {
    const mappingOptions: mapping.MappingOptions = {
      models: {
        Book: {
          tables: ['books'],
          mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),
          columns: { //colums este optional -> mappings rezolva deja problema -> columns = redundant aici
            createdAt: {
              name: 'created_at',
            },
            updatedAt:{
              name: 'updated_at'
            }
          },
        },
      },
    };

    this.bookMapper = this.createMapper<BookEntity>(mappingOptions, 'Book')
  }

  async createBook(book: BookEntity) {
    await this.bookMapper.insert(book);
  }

  async findBookById(id: string){
    return await this.bookMapper.get({ id });
  }

  async findAllBooks() {
    return this.bookMapper.findAll();
  }
}
  /*sync create(book: any): Promise<BookEntity> {
    const id = uuidv4();

    const currentPage = 0;
    const totalPages = book.totalPages;

    const progress = Math.round((currentPage / totalPages) * 100);

    await this.client.execute(
      `
      INSERT INTO books (
        id, title, author, total_pages, current_page,
        progress, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        book.title,
        book.author,
        totalPages,
        currentPage,
        progress,
        'READING',
        new Date(),
      ],
      { prepare: true },
    );

    return {
      id,
      title: book.title,
      author: book.author,
      totalPages,
      currentPage,
      progress,
      status: 'READING',
      createdAt: new Date(),
    };
  }

  async findAll() {
    const result = await this.client.execute('SELECT * FROM books');
    return result.rows;
  }

  async findById(id: string) {
    const result = await this.client.execute(
      'SELECT * FROM books WHERE id = ?',
      [id],
    );
    return result.rows[0];
  }*/

