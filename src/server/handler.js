const { publishPubSubMessage } = require('./../services/pubsub');
const { uploadImageInference } = require('./../services/uploadImage');
const { caloriesInferenceFirestore, caloriesHistoriesFirestore } = require('./../services/loadInferenceResult');
const { uploadUserData, downloadUserData } = require('./../services/userProfile');
const crypto = require('crypto');
const jwt = require('@hapi/jwt');
const bcrypt = require('bcrypt');
const imageType = require('image-type');
const secretKey = process.env.SECRET_KEY;
const bucketName = 'testing-storage-aulia';

// Inference process for calories prediction with image
async function  inferenceEventModelCalories(request, h){
  try {
    const { userId } = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
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
      status:'failed to do inference',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Getting User Histories of Using Calories Predictions
async function getUserCaloriesHistories(request, h){
  try {
    const { userId } = request.auth.credentials;
    const data = await caloriesHistoriesFirestore(userId);
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
    const { userId } = request.auth.credentials;
    const result = (await downloadUserData(userId)).data();
    const response = h.response({
      status:'success',
      statusCode:200,
      message:'Successfully retrieve user data',
      data:{
        name:result.name,
        dateOfBirth:result.dateOfBirth,
        gender:result.gender,
        emailAddress:result.emailAddress
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
    const { name, dateOfBirth, gender, emailAddress, password } = request.payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = {
      name:name,
      dateOfBirth:dateOfBirth,
      gender:gender,
      emailAddress:emailAddress,
      password:hashedPassword
    };
    const check = await downloadUserData(emailAddress);
    if (check.data()){
      throw new Error('Email already registered');
    }
    await uploadUserData(emailAddress, data);
    const payload = {
      userId:emailAddress
    };
    const token = jwt.token.generate(payload, {
      key:secretKey,
      algorithm:'HS256'
    });
    const response = h.response({
      status:'success',
      statusCode:201,
      message:'Successfully creating user',
      token:token
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
    const { emailAddress, password } = request.payload;
    const check = (await downloadUserData(emailAddress)).data();
    const isMatch = await bcrypt.compare(password, check.password);
    if (check == undefined || !isMatch){
      throw new Error('Email or Password Wrong');
    }
    const payload = {
      userId:emailAddress
    };
    const token = jwt.token.generate(payload, {
      key:secretKey,
      algorithm:'HS256'
    });
    const response = h.response({
      status:'success',
      statusCode:200,
      message:'Successfully to login',
      token:token
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