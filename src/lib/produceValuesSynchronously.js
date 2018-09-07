import { createProducer } from './kafkaFactory';

export async function produceValuesSynchronously({ brokerList, topic, records } = {}) {
  const producer = createProducer({ brokerList });

  await producer.connect();


}
