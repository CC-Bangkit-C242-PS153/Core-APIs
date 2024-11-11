const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const POOLING_INTERVAL = 1000;

// Save inference of calories prediction to firestore
async function caloriesInferenceFirestore(userId, inferenceId){
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const doc = await firestore.collection('users')
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

// Getting calories prediction base on user Id
async function caloriesHistoriesFirestore(userId){
  const datas = [];
  const data = await firestore.collection('users')
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



module.exports = { caloriesInferenceFirestore, caloriesHistoriesFirestore };