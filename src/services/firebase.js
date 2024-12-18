const admin = require('firebase-admin');
const { publishPubSubMessage } = require('./../services/pubsub');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAcc = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
const POOLING_INTERVAL = 200;

admin.initializeApp({
  credential: admin.credential.cert(serviceAcc)
});

const db = getFirestore();

// Load user profile
async function downloadUserData(userId){
  return await db.collection('users').doc(userId).get();
}

// Save user profile
async function uploadUserData(userId, data){
  return await db.collection('users').doc(userId).set(data);
}

// Validate firebase auth token
async function validation(request, h) {
  const idToken = request.headers.authorization;

  if (!idToken){
    return h.response({
      status:'error',
      statusCode:401,
      message:'Not Found a Token'
    }).code(401).takeover();
  }

  try {
    // Verification idToken from firebase android
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    await publishPubSubMessage('Warmup', {});
    request.auth.credentials = decodedToken;
    return h.continue;
  } catch (e) {
    return h.response({
      status:'error',
      statusCode:401,
      message:e.message
    }).code(401).takeover();
  }
}

// Save inference of calories prediction to firestore
async function caloriesInferenceFirestore(userId, inferenceId){
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const doc = await db.collection('users')
        .doc(userId)
        .collection('predictions')
        .doc('type')
        .collection('calories')
        .doc(inferenceId)
        .get();
      if (doc.exists){
        clearInterval(interval);
        resolve(doc.data());
      }
    }, POOLING_INTERVAL);

    setTimeout(() => {
      clearInterval(interval);
      reject('Timed Out');
    }, 60000);
  });
}

// Save inference of physical recommendation to firestore
async function physicalInferenceFirestore(userId, inferenceId){
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const doc = await db.collection('users')
        .doc(userId)
        .collection('predictions')
        .doc('type')
        .collection('physical')
        .doc(inferenceId)
        .get();
      if (doc.exists){
        clearInterval(interval);
        resolve(doc.data());
      }
    }, POOLING_INTERVAL);

    setTimeout(() => {
      clearInterval(interval);
      reject('Timed Out');
    }, 60000);
  });
}

// Save inference of sleep recommendation to firestore
async function sleepInferenceFirestore(userId, inferenceId){
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const doc = await db.collection('users')
        .doc(userId)
        .collection('predictions')
        .doc('type')
        .collection('sleep')
        .doc(inferenceId)
        .get();
      if (doc.exists){
        clearInterval(interval);
        resolve(doc.data());
      }
    }, POOLING_INTERVAL);

    setTimeout(() => {
      clearInterval(interval);
      reject('Timed Out');
    }, 60000);
  });
}

// Getting calories prediction base on user Id
async function caloriesHistoriesFirestore(userId){
  const datas = [];
  const data = await db.collection('users')
    .doc(userId)
    .collection('predictions')
    .doc('type')
    .collection('calories')
    .get();
  data.forEach((item) => {
    datas.push(item.data());
  });
  return datas;
}

// Getting calories prediction base on user Id
async function physicalHistoriesFirestore(userId){
  const datas = [];
  const data = await db.collection('users')
    .doc(userId)
    .collection('predictions')
    .doc('type')
    .collection('physical')
    .get();
  data.forEach((item) => {
    datas.push(item.data());
  });
  return datas;
}

// Getting sleep prediction base on user Id
async function sleepHistoriesFirestore(userId){
  const datas = [];
  const data = await db.collection('users')
    .doc(userId)
    .collection('predictions')
    .doc('type')
    .collection('sleep')
    .get();
  data.forEach((item) => {
    datas.push(item.data());
  });
  return datas;
}

module.exports = { downloadUserData, uploadUserData, validation, caloriesInferenceFirestore, caloriesHistoriesFirestore, physicalInferenceFirestore, physicalHistoriesFirestore, sleepInferenceFirestore, sleepHistoriesFirestore };