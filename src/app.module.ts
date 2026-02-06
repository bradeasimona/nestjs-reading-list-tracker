import { Module } from '@nestjs/common';
import { BooksModule } from './modules/books.module';
import { CassandraModule } from './modules/cassandra/cassandra.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CassandraModule,
    BooksModule,
  ]
})
export class AppModule {}
