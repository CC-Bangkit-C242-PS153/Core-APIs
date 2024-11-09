const { hello, postPubSubMessage } =  require('./handler');

const routes = [
  {
    path:'/',
    method:'GET',
    handler:hello
  },
  {
    path:'/{path}',
    method:'POST',
    handler:postPubSubMessage,
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