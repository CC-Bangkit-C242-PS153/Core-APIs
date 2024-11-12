const { inferenceEventModelCalories, getUserCaloriesHistories, inferenceEventModelPhysical, getUserPhysicalHistories, getUserProfile, postUserData } = require('./handler');

const routes = [
  {
    path:'/fitcal/v1/inferences/calories',
    method:'POST',
    handler:inferenceEventModelCalories,
    options: {
      auth:'jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes:1000000
      }
    },
  },
  {
    path:'/fitcal/v1/inferences/calories/{userId}',
    method:'GET',
    handler:getUserCaloriesHistories,
    options:{
      auth:'jwt'
    }
  },
  // {
  //   path:'/fitcal/v1/inferences/physical',
  //   method:'POST',
  //   handler:inferenceEventModelPhysical
  // },
  // {
  //   path:'/fitcal/v1/inferences/physical/{userId}',
  //   method:'GET',
  //   handler:getUserPhysicalHistories
  // },
  {
    path:'/fitcal/v1/users/profile/{userId}',
    method:'GET',
    handler:getUserProfile,
    options:{
      auth:'jwt'
    }
  },
  {
    path:'/fitcal/v1/users/register',
    method:'POST',
    handler:postUserData,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
      },
      auth: false
    },
  }
];

module.exports = { routes };