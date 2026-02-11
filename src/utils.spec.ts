import { checkCassandraConnection } from './utils';
import { Client } from 'cassandra-driver';

describe('checkCassandraConnection', () => {
  it('should NOT throw an error if cassandra client has the connect method', () => {
    const client = {
      connect: jest.fn(),
    } as unknown as Client;

    expect(() => checkCassandraConnection(client)).not.toThrow();
  });

  it('should throw an error if cassandra client has no connect method', () => {
    const client = {} as Client;

    expect(() =>
      checkCassandraConnection(client),
    ).toThrow('Cassandra client not connected!');
  });
});
