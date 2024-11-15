const Hapi = require('@hapi/hapi');
const admin = require('firebase-admin')
require('dotenv').config();
const { routes } = require('./routes');
const InputError = require('../exceptions/InputError');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
})


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

  server.ext('onRequest', async (request, h) => {
    const idToken = request.headers.authorization

    if(!idToken){
      return h.response({error:"Not Found a Token"}).code(401).takeover()
    }

    try{
      // Verification idToken from firebase android
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      request.auth.credentials = decodedToken
      return h.continue
    } catch(e) {
      return h.response({error:"Invalid Token",token:await admin.auth().verifyIdToken(idToken)}).code(401).takeover()
    }
  })

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