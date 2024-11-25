const { inferenceEventModelCalories, getUserCaloriesHistories, inferenceEventModelPhysical, getUserPhysicalHistories, inferenceEventModelSleep, getUserSleepHistories, getUserProfile, postUserData, loginUser } = require('./handler');

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
    path:'/fitcal/v1/inferences/calories',
    method:'GET',
    handler:getUserCaloriesHistories,
  },
  {
    path:'/fitcal/v1/inferences/physical',
    method:'POST',
    handler:inferenceEventModelPhysical
  },
  {
    path:'/fitcal/v1/inferences/physical',
    method:'GET',
    handler:getUserPhysicalHistories
  },
  {
    path:'/fitcal/v1/inferences/sleep',
    method:'POST',
    handler:inferenceEventModelSleep
  },
  {
    path:'/fitcal/v1/inferences/sleep',
    method:'GET',
    handler:getUserSleepHistories
  },
  {
    path:'/fitcal/v1/users/profile',
    method:'GET',
    handler:getUserProfile,
  },
  {
    path:'/fitcal/v1/users/register',
    method:'POST',
    handler:postUserData,
  },
  {
    path:'/fitcal/v1/users/login',
    method:'POST',
    handler:loginUser,
  },
];

module.exports = { routes };