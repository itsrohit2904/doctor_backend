const swaggerAutogen = require('swagger-autogen');
const doc = {
    info: {
      title: 'My API',
      description: 'Description'
    },
    host: 'doctor-backend-4fg7.onrender.com'
  };
  
  const outputFile = './swagger-output.json';
  const routes = ['./routes/adminRoute.js', './routes/doctorRoute.js', './routes/userRoute.js'];
  
  /* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
  root file where the route starts, such as index.js, app.js, routes.js, etc ... */
  
  swaggerAutogen()(outputFile, routes, doc);
  