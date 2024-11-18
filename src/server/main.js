const Hapi = require('@hapi/hapi');
require('dotenv').config();
const { routes } = require('./routes');
const InputError = require('../exceptions/InputError');
const {validation} = require('../services/firebase')

const init = async () => {
  const server = Hapi.server({
    port:process.env.PORT || 8080,
    // host:'localhost',
    routes: {
      cors:{
        origin:['*'],
      }
    }
  });

  server.route(routes);

  server.ext('onRequest', validation)

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response instanceof InputError) {
      const newResponse = h.response({
        status: 'failed due bad request',
        statusCode:400,
        message: response.message
      });
      newResponse.code(400);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'failed',
        statusCode:401,
        message: response.message
      });
      newResponse.code(401);
      return newResponse;
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
};

init();