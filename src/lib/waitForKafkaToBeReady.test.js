import kafkaFactory from './kafkaFactory';
import waitForKafkaToBeReady from './waitForKafkaToBeReady';

jest.mock('./kafkaFactory');

beforeEach(() => {
  jest.mockReset();
});

const baseCfgs = {
  brokerList: 'kafka'
};

test('Should throw if brokerList configuration is not defined', async () => {
  await expect(waitForKafkaToBeReady()).rejects.toThrow('brokerList is a required configuration');
});

test('Should wait for a kafka cluster to be ready', async () => {
  jest.useFakeTimers();
  const waiting = waitForKafkaToBeReady(baseCfgs);
  jest.runAllTimers();
  await expect(waiting).resolves.toBeUndefined();
});

test('Should fail when default timeout threshold(30 seconds) is passed', async () => {
  jest.useFakeTimers();

  kafkaFactory.setMockSettings({ timeToLapse: 35000 });

  const waiting = waitForKafkaToBeReady(baseCfgs);

  jest.runAllTimers();
  await expect(waiting).rejects.toBe('timeout');
});

test('Should fail when custom timeout threshold is passed', async () => {
  jest.useFakeTimers();

  const waiting = waitForKafkaToBeReady({ timeout: 5000, ...baseCfgs });

  jest.runAllTimers();
  await expect(waiting).rejects.toBe('timeout');
});

test('Should fail when attempted disconnect fails', async () => {
  jest.useFakeTimers();

  kafkaFactory.setMockSettings({ failDisconnect: true });

  const waiting = waitForKafkaToBeReady(baseCfgs);

  jest.runAllTimers();
  await expect(waiting).rejects.toBe('failed to disconnect');
});
