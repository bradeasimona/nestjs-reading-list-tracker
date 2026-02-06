import { Module } from '@nestjs/common';
import { CassandraProvider } from './cassandra.provider';

@Module({
  providers: [CassandraProvider],
  exports: [CassandraProvider],
})
export class CassandraModule {}
