import { Provider } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { CASSANDRA_CLIENT } from './cassandra.constants';

export const CassandraProvider: Provider = {
  provide: CASSANDRA_CLIENT,
  useFactory: async () => {
    const client = new Client({
      contactPoints: [
        process.env.CASSANDRA_CONTACT_POINTS || 'localhost',
      ],
      localDataCenter:
        process.env.CASSANDRA_LOCAL_DATA_CENTER || 'dc1',
      keyspace: process.env.CASSANDRA_KEYSPACE,
    });

    await client.connect();
    console.log('Connected to Cassandra');

    return client;
  },
};
