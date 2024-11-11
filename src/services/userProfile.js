const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

// Load user profile
async function downloadUserData(userId){
  return await firestore.collection('users')
    .doc(userId)
    .get();
}

async function uploadUserData(userId, data){
  return await firestore.collection('users')
    .doc(userId)
    .set(data);
}

module.exports = { downloadUserData, uploadUserData };