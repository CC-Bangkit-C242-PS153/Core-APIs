const { publishPubSubMessage } = require('./../services/pubsub');
const {getOrCreateBucket, upload} = require('./../services/uploadImage')
const crypto = require('crypto')

const bucketName = `testing-storage-aulia`

async function inferenceEvent(request, h){
  try {
    const id = crypto.randomUUID()
    const { path } = request.params;
    // const data = request.payload;
    if(path == 'Calories'){
      const {image} = request.payload
      const data = id
      await getOrCreateBucket(bucketName).then(bucketName => upload(bucketName,id,image)).catch(e => e.message)
      await publishPubSubMessage('Calories-ML', data);
    }
    const response = h.response({
      status:'success',
      data:data
    });
    response.code(200);
    return response;
  } catch (e) {
    console.log(e.message);
    return h.response({
      status:'fail'
    }).code(500);
  }
}

module.exports = { inferenceEvent };