const { publishPubSubMessage } = require('./../services/pubsub');
const {getOrCreateBucket, upload} = require('./../services/uploadImage')
const crypto = require('crypto')

const bucketName = `testing-storage-aulia`

function hello(request, h){
  const response = h.response({
    status:'success'
  });
  return response;
}

async function postPubSubMessage(request, h){
  try {
    const id = crypto.randomUUID()
    const { path } = request.params;
    const data = request.payload;
    const response = h.response({
      status:'success',
      data:data
    });
    if(path == 'Calories-ML'){
    const {image} = request.payload
    await getOrCreateBucket(bucketName).then(bucketName => upload(bucketName,id,image)).catch(e => e.message)
    await publishPubSubMessage(path, data);
    }
    response.code(200);
    return response;
  } catch (e) {
    console.log(e.message);
    return h.response({
      status:'fail'
    }).code(500);
  }
}

module.exports = { hello, postPubSubMessage };