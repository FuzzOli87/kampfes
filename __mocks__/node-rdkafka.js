import EventEmitter from 'events';

class SharedCommitLog extends EventEmitter {
  constructor() {
    super();
    this.topics = new Map();
  }

  saveMessage(message) {
    const { topic } = message;

    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }

    const topicLog = this.topics.get(topic);
    topicLog.push(message);

    this.emit('savedMessage', message);
  }
}

const commitLog = new SharedCommitLog();

class BaseMock extends EventEmitter {
  constructor(configurations = {}) {
    super();

    this.configurations = configurations;

    this.connectLapse = 25000;
    this.connectTimeourError = 'timeout';
    this.failDisconnect = false;
    this.failDisconnectError = 'failed to disconnect';
    this.deliveryReportPollingTime = 5000;
  }

  connect(settings, cb) {
    let done = false;
    const { timeout } = settings;
    const { connectLapse, connectTimeourError } = this;

    setTimeout(() => {
      done = true;
    }, connectLapse);

    setTimeout(() => {
      if (done) {
        cb();
      } else {
        cb(connectTimeourError);
      }
    }, timeout);
  }

  disconnect(cb) {
    const { failDisconnect, failDisconnectError } = this;

    if (failDisconnect) {
      cb(failDisconnectError);
    } else {
      cb();
    }
  }
}

class Producer extends BaseMock {
  constructor(configurations = {}) {
    super(configurations);
  }

  // in millis
  setPollInterval(pollTime = 5000) {
    commitLog.on('savedMessage', (message) => {
      this.emit('delivery-report', message);
    });
  }

  produce(topic, partition, message, key, timestamp, opaqueToken) {
    commitLog.saveMessage({
      topic,
      partition,
      message,
      key,
      timestamp,
      opaqueToken
    });
  }
}

class Consumer extends BaseMock {
  constructor(configurations) {
    super(configurations);
  }

  subscribe(topics = []) {
    this.topicsToWatch = topics;
  }

  consume() {

  }
}

const kafka = {
  Producer
};

export default kafka;
