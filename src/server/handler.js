const { publishPubSubMessage } = require('./../services/pubsub');
const { uploadImageInference } = require('./../services/uploadImage');
const { uploadUserData, downloadUserData, caloriesInferenceFirestore, caloriesHistoriesFirestore, physicalInferenceFirestore, physicalHistoriesFirestore, sleepInferenceFirestore, sleepHistoriesFirestore } = require('../services/firebase');
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
    const result = await caloriesInferenceFirestore(userData.uid, inferenceId);
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
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to load data',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Inference process for Physical recommendation with physical activity input
async function inferenceEventModelPhysical(request, h){
  try {
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const { activity } = request.payload;
    const data = {
      userId:userData.uid,
      inferenceId:inferenceId,
      activity:activity
    };
    await publishPubSubMessage('Physical-ML', data);
    const result = await physicalInferenceFirestore(userData.uid, inferenceId);
    const response = h.response({
      status:'Success',
      statusCode:201,
      message:'success to do inference',
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

// Getting User Histories of Using Physical activity recommendations
async function getUserPhysicalHistories(request, h){
  try {
    const userData = request.auth.credentials;
    const data = await physicalHistoriesFirestore(userData.uid);
    const response = h.response({
      status:'success to load data',
      statusCode:200,
      message:'Successfully retrieve user calories predictions histories',
      data
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to load data',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Inference process for Sleep Recommendation recommendation with sleep activity input
async function inferenceEventModelSleep(request, h){
  try {
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const { gender, age, sleepDuration, qualitySleep, physicalActivity, stressLevel, BMI, heartRate, dailySteps, systolic, diastolic } = request.payload;
    const data = {
      userId:userData.uid,
      inferenceId:inferenceId,
      data:{
        gender:gender,
        age:age,
        sleepDuration:sleepDuration,
        qualitySleep:qualitySleep,
        physicalActivity:physicalActivity,
        stressLevel:stressLevel,
        BMI:BMI,
        heartRate:heartRate,
        dailySteps:dailySteps,
        systolic:systolic,
        diastolic:diastolic,
      }
    };
    await publishPubSubMessage('Sleep-ML', data);
    const result = await sleepInferenceFirestore(userData.uid, inferenceId);
    const response = h.response({
      status:'Success',
      statusCode:201,
      message:'success to do inference',
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

// Getting User Histories of Using Sleep activity recommendations
async function getUserSleepHistories(request, h){
  try {
    const userData = request.auth.credentials;
    const data = await sleepHistoriesFirestore(userData.uid);
    const response = h.response({
      status:'success to load data',
      statusCode:200,
      message:'Successfully retrieve user calories predictions histories',
      data
    }).code(200);
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
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to login',
      statusCode:400,
      message:e.message
    }).code(400);
  }
}

module.exports = { inferenceEventModelCalories, getUserCaloriesHistories, inferenceEventModelPhysical, getUserPhysicalHistories, inferenceEventModelSleep, getUserSleepHistories, getUserProfile, postUserData, loginUser };