import kafkaFactory from './kafkaFactory';
import produceValuesSynchronously from './produceValuesSynchronously';

jest.mock('./kafkaFactory');

test('Should produce values synchronously', async () => {
  const brokerList = 'test:9092';
  const topic = 'TestTopic';
  const records = [{
    key: 'KeyOne',
    message: {
      test: 1
    }
  }, {
    key: 'KeyOne',
    message: {
      test: 2
    }
  }, {
    key: 'KeyTwo',
    message: {
      test: 2
    }
  }, {
    key: 'KeyOne',
    message: {
      test: 3
    }
  }];


  const deliveryReportCB = jest.fn();

  kafkaFactory.setMockSettings({
    deliveryReportCB
  });

  await produceValuesSynchronously({ brokerList, topic, records });

  deliveryReportCB.calls.forEach((call, idx) => {
    const [err, message] = call;

    expect(err).toBeNull();
    expect(message).toEqual(records[idx]);
  });
});
