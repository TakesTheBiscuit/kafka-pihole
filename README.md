- √ Add pihole to docker-compose
- √ Then modify pi-to-kafka.js to read from the pihole containers log file?

- `docker-compose up -d`
- `cd pimonitor`
- `node pi-to-kafka`

- visit pihole http://127.0.0.1/admin/
- login with password as per docker-compose
- block a domain like 'reddit.com'

in another terminal:

- `node kafka-consumer`

in a third terminal or a browser:

- visit a blocked domain e.g 'reddit.com'
- you should see a block in the first terminal (running the kafka producer 'pi-to-kafka') and you should shortly see a message on the consumer terminal ('kafka-consumer').

- If you don't want to use a browser use dig e.g `dig reddit.com` in the third terminal.

# working with ksql

- open a shell into the ksql db cli
- `docker-compose exec ksqldb-cli  ksql http://primary-ksqldb-server:8088`

- run this ksql to make a stream

```ksql
CREATE STREAM messages (domain VARCHAR, type VARCHAR)
  WITH (kafka_topic='messages', value_format='json', partitions=1);
```

- and to query for blocked domains table
- `select * from messages;`
