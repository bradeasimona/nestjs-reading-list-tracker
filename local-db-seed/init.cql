CREATE KEYSPACE IF NOT EXISTS reading_list_tracker
    WITH REPLICATION = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 1
    };
