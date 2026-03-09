import { Module, forwardRef } from '@nestjs/common';
import { BooksController } from '../controllers/books.controller';
import { BooksService } from '../services/books.service';
import { BooksRepository } from '../repositories/books.repository';
import { AuthorsModule } from './authors.module';
import { CassandraModule } from '../modules/cassandra/cassandra.module';

@Module({
  imports: [CassandraModule, forwardRef(() => AuthorsModule)],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
  exports: [BooksRepository],
})
export class BooksModule {}
