import kafka from 'node-rdkafka';

async function waitForKafkaToBeReady({ brokerList, timeout = 30000 } = {}) {
  const producer = new kafka.Producer({
    'metadata.broker.list': brokerList
  });

  const consumer = new kafka.KafkaConsumer({
    'metadata.broker.list': brokerList
  });

  await Promise.all([
    producer.connect({ timeout }),
    consumer.connect({ timeout })
  ]);

  await Promise.all([producer, consumer].map(client => client.disconnect()));
}

export default waitForKafkaToBeReady;
