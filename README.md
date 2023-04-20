# Pihole protective dns

Protect your network using pihole and view the blocks in a ui.

This project contains:
- pihole
- kafka
- kafka pihole log reader producer
- ksqldb
- ui (react)
- api (express node js)


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

At the moment this needs setting up when you run ksqldb for the first time
- Could be improved to add this into some sort of .sh script which is run by docker compose each time

- open a shell into the ksql db cli
- `docker-compose exec ksqldb-cli  ksql http://primary-ksqldb-server:8088`

- run this ksql to make a stream

```ksql
CREATE STREAM messages (domain VARCHAR, type VARCHAR)
  WITH (kafka_topic='messages', value_format='json', partitions=1);
```

- and to query for blocked domains stream
- `select * from messages;`

- create a materialized view

```
SET 'auto.offset.reset' = 'earliest';

CREATE TABLE messages_latest AS
SELECT 
  DOMAIN,
  LATEST_BY_OFFSET(MESSAGES.TYPE) TYPE

FROM messages
GROUP BY DOMAIN
EMIT CHANGES;
```

- `show tables;`
- `select * from MESSAGES_LATEST;`


# working with the blocked domains ui
The UI is a react app which connects to websocket and streams the blocked domains to the page in a simple table
- `cd ui`
- `npm i`
- `npm start`

# working with the block domains api (websocket)
This websocket will watch / listen to ksqldb and write to websocket when it sees a new domain
That should complete the full end to end of streaming data from pihole to ui via kafka
- `cd api`
- `npm i`
- `npm socket`
