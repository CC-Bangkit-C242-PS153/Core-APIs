const { inferenceEventModelCalories, getUserCaloriesHistories, inferenceEventModelPhysical, getUserPhysicalHistories, getUserProfile } = require('./handler');

const routes = [
  {
    path:'/fitcal/v1/inferences/calories',
    method:'POST',
    handler:inferenceEventModelCalories,
    options: {
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
    handler:getUserCaloriesHistories
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
    path:'/fitcal/v1/profile/{userId}',
    method:'GET',
    handler:getUserProfile
  }
];

module.exports = { routes };