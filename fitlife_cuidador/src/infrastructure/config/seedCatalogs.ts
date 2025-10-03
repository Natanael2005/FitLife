import { DataSource } from 'typeorm';
import { Allergy } from '../../domain/entities/Allergy';
import { MedicalCondition } from '../../domain/entities/MedicalCondition';

// Normaliza: trim, espacios->'_', MAYÚSCULAS
const slugUpper = (s: string) => s.trim().replace(/\s+/g, '_').toUpperCase();

export async function seedCatalogs(ds: DataSource) {
  const aRepo = ds.getRepository(Allergy);
  const cRepo = ds.getRepository(MedicalCondition);

  // --- 15 ALÉRGENOS ---
  const ALLERGIES: Array<Partial<Allergy>> = [
    { slug: 'GLUTEN',        name: 'Gluten' },
    { slug: 'LACTEOS',       name: 'Lácteos' },
    { slug: 'HUEVO',         name: 'Huevo' },
    { slug: 'SOYA',          name: 'Soya' },
    { slug: 'FRUTOS_SECOS',  name: 'Frutos secos' },
    { slug: 'CACAHUATE',     name: 'Cacahuate' },
    { slug: 'SESAMO',        name: 'Sésamo' },
    { slug: 'PESCADO',       name: 'Pescado' },
    { slug: 'MARISCOS',      name: 'Mariscos' },
    { slug: 'MOSTAZA',       name: 'Mostaza' },
    { slug: 'APIO',          name: 'Apio' },
    { slug: 'ALTRAMUZ',      name: 'Altramuces' },
    { slug: 'SULFITOS',      name: 'Sulfitos' },
    { slug: 'MAIZ',          name: 'Maíz' },
    { slug: 'CITRICOS',      name: 'Cítricos' },
  ].map(a => ({ ...a, slug: slugUpper(String(a.slug)) }));

  // --- 15 CONTRAINDICACIONES ---
  const CONDITIONS: Array<Partial<MedicalCondition>> = [
    { slug: 'PROBLEMAS_CARDIACOS',        name: 'Problemas cardíacos' },
    { slug: 'HIPERTENSION_NO_CONTROLADA', name: 'Hipertensión no controlada' },
    { slug: 'ARRITMIAS',                  name: 'Arritmias' },
    { slug: 'INSUFICIENCIA_CARDIACA',     name: 'Insuficiencia cardíaca' },
    { slug: 'CIRUGIA_RECIENTE',           name: 'Cirugía reciente' },
    { slug: 'FRACTURA_RECIENTE',          name: 'Fractura reciente' },
    { slug: 'HERNIA_DISCAL',              name: 'Hernia discal' },
    { slug: 'OSTEOPOROSIS_SEVERA',        name: 'Osteoporosis severa' },
    { slug: 'EMBARAZO_RIESGO',            name: 'Embarazo de alto riesgo' },
    { slug: 'TROMBOSIS_RECIENTE',         name: 'Trombosis reciente' },
    { slug: 'EPOC',                       name: 'EPOC' },
    { slug: 'ASMA',                       name: 'Asma' },
    { slug: 'LESION_ESPALDA',             name: 'Lesión de espalda' },
    { slug: 'LESION_RODILLA',             name: 'Lesión de rodilla' },
    { slug: 'LESION_HOMBRO',              name: 'Lesión de hombro' },
  ].map(c => ({ ...c, slug: slugUpper(String(c.slug)) }));

  // Upserts idempotentes por slug
  await aRepo.upsert(ALLERGIES, ['slug']);
  await cRepo.upsert(CONDITIONS, ['slug']);

  console.log(`[seedCatalogs] Allergies upserted: ${ALLERGIES.length}`);
  console.log(`[seedCatalogs] Conditions upserted: ${CONDITIONS.length}`);
}
