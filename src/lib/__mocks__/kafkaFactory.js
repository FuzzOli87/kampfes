let mockSettings = {
  timeToLapse: 25000,
  timeoutError: 'timeout',
  failDisconnect: false,
  failDisconnectError: 'failed to disconnect'
};

function setMockSettings(settings = {}) {
  mockSettings = { ...mockSettings, ...settings };
}

function resetMockSettings() {
  mockSettings = {
    timeToLapse: 25000,
    timeoutError: 'timeout',
    failDisconnectError: 'failed to disconnect'
  };
}

const mockClient = {
  connect(settings) {
    let done = false;
    const { timeout } = settings;
    const { timeToLapse, timeoutError } = mockSettings;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        done = true;
      }, timeToLapse);

      setTimeout(() => {
        if (done) {
          resolve();
        } else {
          reject(timeoutError);
        }
      }, timeout);
    });
  },
  disconnect() {
    const { failDisconnect } = mockSettings;
    return new Promise((resolve, reject) => {
      if (failDisconnect) {
        reject(mockSettings.failDisconnectError);
      } else {
        resolve();
      }
    });
  }
};

const mockProducer = {
  mockCommitLog: [],
  produce(topic, partition, message, key, timestamp, opaqueToken) {
    this.mockCommitLog.push({
      topic,
      partition,
      message,
      key,
      timestamp,
      opaqueToken
    });
  },
  on(event, cb) {
    if (event === 'delivery-report') {
      setInterval(() => {
        const firstItem = this.mockCommitLog.shift();
        cb(null, firstItem);
      }, 5000);
    }
  }
};

function createClient({ brokerList }) {
  if (!brokerList) {
    throw Error('brokerList is a required configuration');
  }

  return mockClient;
}

const createProducer = jest.fn(settings => {
  const { brokerList } = settings;

  if (!brokerList) {
    throw Error('brokerList is a required configuration');
  }
});

function createProducer(settings) {
  const { brokerList } = settings;

  if (!brokerList) {
    throw Error('brokerList is a required configuration');
  }

  return { ...mockClient, ...mockProducer };
}

function createConsumer(settings) {
  return createClient(settings);
}

export { createProducer, createConsumer };

export default {
  createProducer,
  resetMockSettings,
  setMockSettings
};
