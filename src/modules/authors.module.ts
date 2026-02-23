import { Module } from '@nestjs/common';
import { AuthorsController } from '../controllers/authors.controller';
import { AuthorsService } from '../services/authors.service';
import { AuthorsRepository } from '../repositories/authors.repository';
import { CassandraModule } from '../modules/cassandra/cassandra.module';

@Module({
  imports: [CassandraModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository],
})
export class AuthorsModule {}
