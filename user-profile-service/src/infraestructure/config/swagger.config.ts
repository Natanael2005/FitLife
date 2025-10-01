import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Service API - FitLife',
      version: '1.0.0',
      description: 'Documentación de la API del servicio de notificaciones de FitLife',
    },
  },
  apis: ['./src/infrastructure/adapters/input/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);