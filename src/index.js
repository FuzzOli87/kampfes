import { promisify } from 'util';
import kafka from 'node-rdkafka';

async function waitForKafkaToBeReady({ brokerList, timeout = 30000 } = {}) {
  if (!brokerList) {
    throw Error('brokerList is a required configuration');
  }

  const producer = new kafka.Producer({
    'metadata.broker.list': brokerList
  });

  const consumer = new kafka.KafkaConsumer({
    'metadata.broker.list': brokerList
  });

  producer.connect = promisify(producer.connect);
  consumer.connect = promisify(consumer.connect);

  producer.disconnect = promisify(producer.disconnect);
  consumer.disconnect = promisify(consumer.disconnect);

  const clients = [producer, consumer];

  await Promise.all(clients.map(client => client.connect({ timeout })));
  await Promise.all(clients.map(client => client.disconnect()));
}

export default { waitForKafkaToBeReady };
