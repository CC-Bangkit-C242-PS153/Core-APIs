const { inferenceEventModelCalories, resultModelCalories } = require('./handler');

const routes = [
  {
    path:'/inferences/calories',
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
    path:'/inferences/calories/histories',
    method:'GET',
    handler:resultModelCalories
  }
];

module.exports = { routes };