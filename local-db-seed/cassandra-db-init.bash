#!/bin/bash
set -e

# Define the Docker container name or ID
CONTAINER_NAME="cassandra-reading-tracker"
CLEAN_UP=${1:-""}

if [ "$ENV" != "local" ]; then
  echo "Seed container disabled outside local environment"
  exit 0
fi

if [ "$CLEAN_UP" == "cleanup" ]; then
  echo "Cleaning up Cassandra keyspace..."
  cqlsh $CONTAINER_NAME -f /seed-data/delete-data.cql
  echo "Cassandra keyspace cleaned up."
fi

echo "Starting Cassandra initialization..."
until cqlsh $CONTAINER_NAME -e "DESCRIBE keyspaces" >/dev/null 2>&1; do
    echo "Cassandra not ready yet, retrying in 5s..."
    sleep 5
done

echo "Running init.cql..."
cqlsh $CONTAINER_NAME -f /seed-data/init.cql
echo "Cassandra initialization done."
# Create tables
find /seed-data/ -type f -name '*.sql' | sort | while read file; do
    echo "Executing $file..."
    cqlsh $CONTAINER_NAME -f $file
done

echo "Cassandra tables have been created."
