import { Client } from 'cassandra-driver';

export function checkCassandraConnection(cassandraClient: Client): void {
  if (!cassandraClient.connect) {
    throw new Error('Cassandra client not connected!');
  }
}
