FROM cassandra:4

COPY . /seed-data/

RUN chmod +x /seed-data/cassandra-db-init.bash

ENTRYPOINT ["/seed-data/cassandra-db-init.bash"] 
