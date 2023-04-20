# Pihole protective dns

Protect your network using pihole and view the blocks in a ui - in realtime!

This project contains:
- pihole
- kafka
- kafka pihole log reader producer
- ksqldb
- ui (react)
- api (websocket server in node js)

## How it works
- pihole runs in docker, with a volume mount for its log file
- kafka runs in docker
- running the `pi-to-kafka.js` nodejs script will tail the pihole log and write to kafka (producer)
- ksqldb is hooked up to the imaginatively named kafka topic `messages` 
- a ksql stream and table is created
- The websocket backend is started see `/api` - `node socket` which offers a websocket connection and watches the ksql streaming table, when a new record comes in it is pushed out over the websocket if a client is connected
- The REACT ui is started see `/ui` and visited at `http://localhost` 
- Hitting a domain defined as 'blocked' in pihole (see pihole admin) should result in seeing that domain within a second or two in the ui thanks to the websocket

## Running things

### first terminal
- `docker-compose up -d` [wait for a couple mins for all services to come up]
- `cd pimonitor`
- `node pi-to-kafka` [reads pihole log, writes to kafka]

- visit pihole http://127.0.0.1/admin/
- login with password as per docker-compose `random1`
- block a domain like 'reddit.com' (used in examples further down the doc)
- You can visit kafka ui http://127.0.0.1:8080 which enables you to see topics and brokers (local > topics > `messages`)

### in a second terminal (optional):

- [optional] in another terminal if you want to watch kafka:
- `node kafka-consumer`

### in a third terminal or a browser:

- visit a blocked domain e.g 'reddit.com'
- you should see a block in the first terminal (running the kafka producer 'pi-to-kafka') and you should shortly see a message on the consumer terminal ('kafka-consumer').
- If you don't want to use a browser use dig e.g `dig reddit.com` in the third terminal.
- follow steps in ksql section next and then follow through the websocket (api) and ui elements to get it all up and running

### working with ksql

**At the moment this needs setting up when you run ksqldb for the first time**
- @todo: Could be improved to add this into some sort of .sh script which is run by docker compose each time

- open a shell into the ksql db cli
- `docker-compose exec ksqldb-cli  ksql http://primary-ksqldb-server:8088`

  - if you see error: `Caused by: Could not connect to the server. Please check the server details are correct and that the server is running.` then:
    - CTRL+C the original docker-compose and
    - docker-compose up
    - wait 2 mins
    - try again

- run this ksql to make a stream from the kafka topic:

```ksql
CREATE STREAM messages (domain VARCHAR, type VARCHAR)
  WITH (kafka_topic='messages', value_format='json', partitions=1);
```

- and to query for blocked domains stream
- `select * from messages;`

- create a materialized view (used by the `socket.js` script to publish onto the websocket)

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


### working with the block domains api (websocket)
This websocket will watch / listen to ksqldb and write to websocket when it sees a new domain
That should complete the full end to end of streaming data from pihole to ui via kafka.
Running the websocket before starting the ui is a pre-req.

- in a new terminal:
- `cd api`
- `npm i`
- `node socket`


### working with the blocked domains ui
The UI is a react app which connects to websocket and streams the blocked domains to the page in a simple table
- in a new terminal:
- `cd ui`
- `npm i`
- `npm start`

