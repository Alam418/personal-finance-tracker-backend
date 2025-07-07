import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Personal Finance Tracker API',
    description: 'Automatically generated with swagger-autogen',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; 

swaggerAutogen()(outputFile, endpointsFiles, doc);
