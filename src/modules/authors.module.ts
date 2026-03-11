import { Module, forwardRef } from '@nestjs/common';
import { AuthorsController } from '../controllers/authors.controller';
import { AuthorsService } from '../services/authors.service';
import { AuthorsRepository } from '../repositories/authors.repository';
import { CassandraModule } from '../modules/cassandra/cassandra.module';
import { BooksModule } from '../modules/books.module';

@Module({
  imports: [CassandraModule, forwardRef(() => BooksModule)],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository],
  exports: [AuthorsRepository],
})
export class AuthorsModule {}
