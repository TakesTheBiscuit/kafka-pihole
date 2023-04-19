const Tail = require("tail").Tail;
const { Kafka } = require("kafkajs");

// the environment variable KAFKA_BOOTSTRAP_SERVER
const client = "piholetokafka";
const version = 1;
const topic = 'messages';

const kafka = new Kafka({
  clientId: client,
  brokers: ["127.0.0.1:9092"],
});

let consumer = null;

try {
  consumer = kafka.consumer({ groupId: 'pihole-consumer' })
  consumer.connect();
} catch (exception) {
  console.error(exception);
}

consumer.subscribe({ topics: [topic], fromBeginning: true });

consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
            key: message.key.toString(),
            value: message.value.toString(),
            headers: message.headers,
        })
    },
});