import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User';
import { Allergy } from '../../domain/entities/Allergy';
import { MedicalCondition } from '../../domain/entities/MedicalCondition';
import { UserAllergy } from '../../domain/entities/UserAllergy';
import { UserMedicalCondition } from '../../domain/entities/UserMedicalCondition';
import { UserHealthData } from '../../domain/entities/UserHealthData';
import { Exercise } from '../../domain/entities/demo/Exercise';
import { Food } from '../../domain/entities/demo/Food';
import { PublicRoutine } from '../../domain/entities/demo/PublicRoutine';
import { RoutineExercise } from '../../domain/entities/demo/RoutineExercise';
import { RoutineFood } from '../../domain/entities/demo/RoutineFood';

let ds: DataSource | null = null;

export async function getDataSource() {
  if (ds && ds.isInitialized) return ds;
  ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'Felipe1416',
    database: process.env.DB_NAME || 'fitlife',
    entities: [
      User,
      Allergy,
      MedicalCondition,
      UserAllergy,
      UserMedicalCondition,
      UserHealthData,
      Exercise,
      Food,
      PublicRoutine,
      RoutineExercise, 
      RoutineFood,
    ],
    synchronize: false, // en dev: true si no tienes migraciones aún
    logging: false
  });
  if (!ds.isInitialized) await ds.initialize();
  return ds;
}