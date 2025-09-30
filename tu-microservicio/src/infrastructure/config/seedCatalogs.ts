import { DataSource } from 'typeorm';
import { Allergy } from '../../domain/entities/Allergy';
import { MedicalCondition } from '../../domain/entities/MedicalCondition';

export async function seedCatalogs(ds: DataSource) {
  const aRepo = ds.getRepository(Allergy);
  const cRepo = ds.getRepository(MedicalCondition);

  const allergies: Partial<Allergy>[] = [
    { id: 'gluten', name: 'Gluten' },
    { id: 'lacteos', name: 'Lácteos' },
    { id: 'mariscos', name: 'Mariscos' },
    { id: 'frutos_secos', name: 'Frutos secos' },
    { id: 'huevo', name: 'Huevo' },
    { id: 'soya', name: 'Soya' },
  ];

  const conditions: Partial<MedicalCondition>[] = [
    { id: 'lesion_rodilla', name: 'Lesión de rodilla' },
    { id: 'lesion_espalda', name: 'Lesión de espalda' },
    { id: 'lesion_hombro', name: 'Lesión de hombro' },
    { id: 'problemas_cardiacos', name: 'Problemas cardíacos' },
    { id: 'asma', name: 'Asma' },
  ];

  await aRepo.upsert(allergies, ['id']);
  await cRepo.upsert(conditions, ['id']);
}