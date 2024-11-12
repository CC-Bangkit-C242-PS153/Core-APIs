const Hapi = require('@hapi/hapi');
const jwt = require('@hapi/jwt');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const { routes } = require('./routes');
const InputError = require('../exceptions/InputError');

const init = async () => {
  const server = Hapi.server({
    port:process.env.PORT || 8080,
    // host:'localhost',
    routes: {
      cors:{
        origin:['*']
      }
    }
  });

  // plugin hapi/jwt
  await server.register(jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys:secretKey,
    verify:{
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec:3600,
      timeSkewSec: 15
    },
    validate:(artifacts, request, h) => {
      return {
        isValid:true,
        credentials:{ userId:artifacts.decoded.payload.userId }
      };
    }
  });

  server.route(routes);
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response instanceof InputError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(400);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(413);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
};

init();