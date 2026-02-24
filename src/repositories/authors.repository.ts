import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, mapping } from 'cassandra-driver';
import { CASSANDRA_CLIENT } from '../modules/cassandra/cassandra.constants';
import { AuthorEntity } from '../entities/author.entity';
import { checkCassandraConnection } from '../utils';

@Injectable()
export class AuthorsRepository implements OnModuleInit {
  private authorMapper!: mapping.ModelMapper<AuthorEntity>;

  constructor(
    @Inject(CASSANDRA_CLIENT)
    private readonly cassandraClient: Client,
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
        Author: {
          tables: ['authors'],
          mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),
        },
      },
    };
    this.authorMapper = this.createMapper<AuthorEntity>(
      mappingOptions,
      'Author',
    );
  }

  async createAuthor(author: AuthorEntity) {
    await this.authorMapper.insert(author);
  }
}
