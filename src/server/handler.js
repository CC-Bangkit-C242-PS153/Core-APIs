const { publishPubSubMessage } = require('./../services/pubsub');
const {upload} = require('./../services/uploadImage')
const crypto = require('crypto')
const imageType = require('image-type');

const bucketName = `testing-storage-aulia`

async function inferenceEventModelCalories(request, h){
  try {
    const id = crypto.randomUUID()
    const {image} = request.payload
      const type = imageType(image)
      await upload(bucketName,id,image,type).catch(e => e.message)
      const data = { 
        id:id,
        type:type
      }
      await publishPubSubMessage('Calories-ML', data);
    const response = h.response({
      status:'success',
      message:'Success to Send message',
      data:data
    });
    response.code(200);
    return response
  } catch (e) {
    return h.response({
      status:'fail'
    }).code(500);
  }
}

async function resultModelCalories(request, h){
  const pubsubMessage = request.payload.message.data
  console.log(pubsubMessage)
  const response = h.response({
    status:'success',
    pubsubMessage
  })
  // console.log(response)
  return response
}

// function decodeBase64Json(data) {
//   return JSON.parse(Buffer.from(data, 'base64').toString());
// }

module.exports = { inferenceEventModelCalories, resultModelCalories };