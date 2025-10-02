import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Profile Service API - FitLife',
      version: '1.0.0',
      description: 'Documentación de la API del servicio de perfiles de usuario de FitLife',
    },
  },
  components: {
    schemas: {
      CreateUserProfileDto: {
        type: 'object',
        properties: {
          uid: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          gender: { type: 'string' },
          profileCompleted: { type: 'boolean' },
          enableRecordatorios: { type: 'boolean' },
          notificationToken: { type: 'string' },
        },
        required: ['uid', 'firstName', 'lastName', 'gender', 'profileCompleted', 'enableRecordatorios'],
      },
    },
  },
  apis: ['./src/infraestructure/adapters/input/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);