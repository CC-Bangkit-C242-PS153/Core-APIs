const { publishPubSubMessage } = require('./../services/pubsub');
const { uploadImageInference } = require('./../services/uploadImage');
const { caloriesInferenceFirestore, caloriesHistoriesFirestore } = require('./../services/loadInferenceResult');
const { uploadUserData, downloadUserData } = require('./../services/userProfile');
const crypto = require('crypto');
const imageType = require('image-type');
const bucketName = process.env.BUCKET_NAME;

// Inference process for calories prediction with image
async function  inferenceEventModelCalories(request, h){
  try {
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const { image } = request.payload;
    const type = imageType(image);
    await uploadImageInference(bucketName, inferenceId, image, type).catch((e) => e.message);
    const data = {
      userId:userData.uid,
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
      status:'failed to do inference',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Getting User Histories of Using Calories Predictions
async function getUserCaloriesHistories(request, h){
  try {
    const userData = request.auth.credentials;
    const data = await caloriesHistoriesFirestore(userData.uid);
    const response = h.response({
      status:'success to load data',
      statusCode:200,
      message:'Successfully retrieve user calories predictions histories',
      data
    });
    response.code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to load data',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Getting User Datas to Profile Pages
async function getUserProfile(request, h){
  try {
    const userData = request.auth.credentials;
    const data = (await downloadUserData(userData.uid)).data();
    const response = h.response({
      status:'success',
      statusCode:200,
      message:'Successfully retrieve user data',
      data:{
        name:data.name,
        picture:data.picture,
        email:data.email,
        uid:data.uid
      }
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'fail to retrieve users data',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Post user data while register
async function postUserData(request, h){
  try {
    const userData = request.auth.credentials;
    const data = {
      name:userData.name,
      picture:userData.picture,
      email:userData.email,
      uid:userData.uid
    };
    console.log(data)
    const check = await downloadUserData(userData.uid);
    if (check.data()){
      throw new Error('Email already registered');
    }
    await uploadUserData(userData.uid, data);
    const response = h.response({
      status:'success',
      statusCode:201,
      message:'Successfully creating user',
      data
    }).code(201);
    return response;
  } catch (e){
    return h.response({
      status:'fail creating user',
      statusCode:400,
      message:e.message
    }).code(400);
  }
}

// Checking user data while login
async function loginUser(request, h){
  try {
    const userData = request.auth.credentials;
    const check = (await downloadUserData(userData.uid)).data();
    if (check == undefined){
      throw new Error('Account not found, Registered first');
    }
    const response = h.response({
      status:'success',
      statusCode:200,
      message:'Successfully to login',
    }).code(201);
    return response;
  } catch (e){
    return h.response({
      status:'failed to login',
      statusCode:400,
      message:e.message
    }).code(400);
  }
}

module.exports = { inferenceEventModelCalories, getUserCaloriesHistories, getUserProfile, postUserData, loginUser };