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

let producer = null;

try {
  producer = kafka.producer();
  producer.connect();
} catch (exception) {
  console.error(exception);
}

var tail = new Tail("../var-log/pihole/pihole.log");
tail.watch();
tail.on("line", (data) => {

  if (data.includes("blacklisted")) {
    data = data.replace(" is ::", "");
    const parseLine = data.split("blacklisted");
    const observedDomain = parseLine[1].replace('is 0.0.0.0','').replace(" ", "");
    console.log(`~ Blocked domain: ${observedDomain}`);
    const response = postToKafka(producer, client, version, topic, observedDomain, "blocked");
  }
});

async function postToKafka(
  producer,
  publisherName,
  publisherVersion,
  topic,
  observedDomain,
  blockType
) {
  try {
    const responses = await producer.send({
      topic: topic,
      messages: [
        {
          key: publisherName,
          value: JSON.stringify({
            package: publisherName,
            version: publisherVersion,
            domain: observedDomain.replace(' ',''),
            type: blockType,
          }),
        },
      ],
    });

    // console.log("Published message", { responses });
  } catch (exception) {
    console.error(exception);
  }
}
