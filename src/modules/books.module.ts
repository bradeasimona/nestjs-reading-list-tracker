import { Module } from '@nestjs/common';
import { BooksController } from '../controllers/books.controller';
import { BooksService } from '../services/books.service';
import { BooksRepository } from '../repositories/books.repository';
import { CassandraModule } from '../modules/cassandra/cassandra.module';

@Module({
  imports: [CassandraModule],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
})
export class BooksModule {}
