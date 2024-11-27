const { GoogleGenerativeAI } = require('@google/generative-ai');
const { publishPubSubMessage } = require('./../services/pubsub');
const { uploadImageInference } = require('./../services/uploadImage');
const InputError = require('../exceptions/InputError');
const { uploadUserData, downloadUserData, caloriesInferenceFirestore, caloriesHistoriesFirestore, physicalInferenceFirestore, physicalHistoriesFirestore, sleepInferenceFirestore, sleepHistoriesFirestore } = require('../services/firebase');
const crypto = require('crypto');
const imageType = require('image-type');
const bucketName = process.env.BUCKET_NAME;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini APIs for creating content with prompt
async function run(prompt) {
  const model = genAI.getGenerativeModel({
    model:'gemini-1.5-flash-8b',
    temperature: 0.8,
    systemInstruction:'You are a healthy life instructor'
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Inference process for calories prediction with image
async function  inferenceEventModelCalories(request, h){
  try {
    const { image, water, protein, lipid, ash, carbohydrate, fiber, sugar } = request.payload;
    const check = [image, water, protein, lipid, ash, carbohydrate, fiber, sugar];
    check.forEach((element) => {
      if (element === undefined) {
        throw new InputError('Some properties is not defined, please check the payload');
      }
    });
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const type = imageType(image);
    await uploadImageInference(bucketName, inferenceId, image, type).catch((e) => e.message);
    const data = {
      userId:userData.uid,
      inferenceId:inferenceId,
      data:{
        type:type,
        water:water.toString(),
        protein:protein.toString(),
        lipid:lipid.toString(),
        ash:ash.toString(),
        carbohydrate:carbohydrate.toString(),
        fiber:fiber.toString(),
        sugar:sugar.toString()
      }
    };
    await publishPubSubMessage('Calories-ML', data);
    const result = await caloriesInferenceFirestore(userData.uid, inferenceId);
    const suggestion = await run(`Menggunakan JSON schema berikut. {saran:{activtities1:{activity:str,reason:str},activtities2:{activity:str,reason:str}}}. list 2 saran untuk manusia yang makan satu porsi dengan ${result.result} kalori.`);
    const cleanedText = suggestion
      .replace(/```json\n/, '') // Menghapus ```json\n di awal
      .replace(/```/g, '');    // Menghapus ``` di akhir
    const convertedSuggestion = JSON.parse(cleanedText);
    result.suggestion = convertedSuggestion.saran;
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
      status:'failed to load data calories inference',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Inference process for Physical recommendation with physical activity input
async function inferenceEventModelPhysical(request, h){
  try {
    const { gender, age, height, weight, duration, heartRate, bodyTemp } = request.payload;
    const check = [gender, age, height, weight, duration, heartRate, bodyTemp];
    check.forEach((element) => {
      if (element === undefined) {
        throw new InputError('Some properties is not defined, please check the payload');
      }
    });
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const data = {
      userId:userData.uid,
      inferenceId:inferenceId,
      data:{
        gender:gender.toString(),
        age:age.toString(),
        height:height.toString(),
        weight:weight.toString(),
        duration:duration.toString(),
        heartRate:heartRate.toString(),
        bodyTemp:bodyTemp.toString()
      }
    };
    await publishPubSubMessage('Physical-ML', data);
    const result = await physicalInferenceFirestore(userData.uid, inferenceId);
    const suggestion = await run(`Menggunakan JSON schema berikut. {saran:{activtities1:{activity:str,reason:str},activtities2:{activity:str,reason:str}}}. list 2 saran untuk manusia yang sudah melakukan aktivitas fisik yang mengeluarkan ${result.result} kalori sehari.`);
    const cleanedText = suggestion
      .replace(/```json\n/, '') // Menghapus ```json\n di awal
      .replace(/```/g, '');    // Menghapus ``` di akhir
    const convertedSuggestion = JSON.parse(cleanedText);
    result.suggestion = convertedSuggestion.saran;
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
      message:'Successfully retrieve user physical predictions histories',
      data
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to load data physical inferences',
      statusCode:500,
      message:e.message
    }).code(500);
  }
}

// Inference process for Sleep Recommendation recommendation with sleep activity input
async function inferenceEventModelSleep(request, h){
  try {
    const { gender, age, sleepDuration, qualitySleep, physicalActivity, stressLevel, BMI, heartRate, dailySteps, systolic, diastolic } = request.payload;
    const check = [gender, age, sleepDuration, qualitySleep, physicalActivity, stressLevel, BMI, heartRate, dailySteps, systolic, diastolic];
    check.forEach((element) => {
      if (element === undefined) {
        throw new InputError('Some properties is not defined, please check the payload');
      }
    });
    const userData = request.auth.credentials;
    const inferenceId = crypto.randomUUID();
    const data = {
      userId:userData.uid,
      inferenceId:inferenceId,
      data:{
        gender:gender.toString(),
        age:age.toString(),
        sleepDuration:sleepDuration.toString(),
        qualitySleep:qualitySleep.toString(),
        physicalActivity:physicalActivity.toString(),
        stressLevel:stressLevel.toString(),
        BMI:BMI.toString(),
        heartRate:heartRate.toString(),
        dailySteps:dailySteps.toString(),
        systolic:systolic.toString(),
        diastolic:diastolic.toString(),
      }
    };
    await publishPubSubMessage('Sleep-ML', data);
    const result = await sleepInferenceFirestore(userData.uid, inferenceId);
    const suggestion = await run(`Menggunakan JSON schema berikut. {saran:{activtities1:{activity:str,reason:str},activtities2:{activity:str,reason:str}}}. list 2 saran aktivitas untuk manusia dengan kondisi tidur ${result.result}.`);
    const cleanedText = suggestion
      .replace(/```json\n/, '') // Menghapus ```json\n di awal
      .replace(/```/g, '');    // Menghapus ``` di akhir
    const convertedSuggestion = JSON.parse(cleanedText);
    result.suggestion = convertedSuggestion.saran;
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
      message:'Successfully retrieve user sleep predictions histories',
      data
    }).code(200);
    return response;
  } catch (e){
    return h.response({
      status:'failed to load data sleep inference',
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