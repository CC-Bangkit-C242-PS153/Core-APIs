const { publishPubSubMessage } = require('./../services/pubsub');
const { uploadImageInference } = require('./../services/uploadImage');
const { caloriesInferenceFirestore, caloriesHistoriesFirestore } = require('./../services/loadInferenceResult');
const { uploadUserData, downloadUserData } = require('./../services/userProfile');
const crypto = require('crypto');
const imageType = require('image-type');
const bucketName = 'testing-storage-aulia';

// Inference process for calories prediction with image
async function inferenceEventModelCalories(request, h){
  try {
    const inferenceId = crypto.randomUUID();
    const userId = crypto.randomUUID(); // Diubah ketika sudah membuat service login
    const { image } = request.payload;
    const type = imageType(image);
    await uploadImageInference(bucketName, inferenceId, image, type).catch((e) => e.message);
    const data = {
      userId:userId,
      inferenceId:inferenceId,
      type:type
    };
    await publishPubSubMessage('Calories-ML', data);
    const result = await caloriesInferenceFirestore(userId, inferenceId);
    const response = h.response({
      status:'Success',
      statusCode:201,
      message:'Model Predicted Succesfully',
      result
    }).code(201);
    return response;
  } catch (e) {
    return h.response({
      status:'fail',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Getting User Histories of Using Calories Predictions
async function getUserCaloriesHistories(request, h){
  try {
    const { userId } = request.params;
    const data = await caloriesHistoriesFirestore(userId);
    const response = h.response({
      status:'success',
      statusCode:200,
      data
    });
    response.code(200);
    return response;
  } catch (e){
    return h.response({
      status:'fail',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Getting User Datas to Profile Pages
async function getUserProfile(request, h){
  try {
    const { userId } = request.params;
    const result = await downloadUserData(userId);
    const response = h.response({
      status:'success',
      statusCode:200,
      result:result.data()
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'fail',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

module.exports = { inferenceEventModelCalories, getUserCaloriesHistories, getUserProfile };