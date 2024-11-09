const { inferenceEvent } =  require('./handler');

const routes = [
  {
    path:'/inference/{model}',
    method:'POST',
    handler:inferenceEvent,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes:1000000
      }
    }
  }
];

module.exports = { routes };