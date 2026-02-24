import { Module } from '@nestjs/common';
import { BooksModule } from './modules/books.module';
import { AuthorsModule } from './modules/authors.module';
import { CassandraModule } from './modules/cassandra/cassandra.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CassandraModule,
    BooksModule,
    AuthorsModule,
  ],
})
export class AppModule {}
