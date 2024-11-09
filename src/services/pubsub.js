const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

async function publishPubSubMessage(path, data) {
  const buffer = Buffer.from(JSON.stringify(data));
  await pubsub.topic(path).publish(buffer);
}

module.exports = { publishPubSubMessage };