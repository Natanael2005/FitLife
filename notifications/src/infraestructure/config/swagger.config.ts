import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Service API',
      version: '1.0.0',
      description: 'API documentation for the Notification Service',
    },
  },
  apis: ['./src/infrastructure/adapters/input/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);