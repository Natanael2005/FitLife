import { DataSource } from 'typeorm';
import { Exercise } from '../../domain/entities/demo/Exercise';
import { Food } from '../../domain/entities/demo/Food';
import { PublicRoutine } from '../../domain/entities/demo/PublicRoutine';
import { RoutineExercise } from '../../domain/entities/demo/RoutineExercise';
import { RoutineFood } from '../../domain/entities/demo/RoutineFood';

const U = (s: string) => s.trim().replace(/\s+/g, '_').toUpperCase();
const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '')
   .replace(/\s+/g, '-').slice(0, 60);

type Nivel = 'BAJO' | 'INTERMEDIO' | 'AVANZADO';

type SeedExercise = {
  nombre: string; categoria?: string | null;
  contraindicaciones: string[]; nivel: Nivel;
  series_recomendadas?: number | null; repeticiones_recomendadas?: number | null;
};

type SeedFood = { nombre: string; categoria?: string | null; alergenos: string[]; };

type SeedRoutine = {
  nombre: string; dias: string[]; ejercicios: string[]; alimentos: string[];
};

const EXERCISES: SeedExercise[] = [
  { nombre:'Press de Banca', categoria:'Pecho',
    contraindicaciones:['PROBLEMAS_CARDIACOS','TROMBOSIS_RECIENTE','ASMA','LESION_ESPALDA','LESION_HOMBRO'].map(U),
    nivel:'INTERMEDIO', series_recomendadas:4, repeticiones_recomendadas:10 },
  { nombre:'Sentadilla', categoria:'Piernas',
    contraindicaciones:['LESION_RODILLA','FRACTURA_RECIENTE','OSTEOPOROSIS_SEVERA','LUMBALGIA','HERNIA_DISCAL'].map(U),
    nivel:'INTERMEDIO', series_recomendadas:4, repeticiones_recomendadas:10 },
  { nombre:'Peso Muerto', categoria:'Espalda',
    contraindicaciones:['LUMBALGIA','HERNIA_DISCAL','LESION_ESPALDA','CIRUGIA_RECIENTE'].map(U),
    nivel:'AVANZADO', series_recomendadas:3, repeticiones_recomendadas:5 },
  { nombre:'Remo con Mancuerna', categoria:'Espalda',
    contraindicaciones:['LESION_ESPALDA','HERNIA_DISCAL'].map(U),
    nivel:'INTERMEDIO', series_recomendadas:4, repeticiones_recomendadas:12 },
  { nombre:'Plancha', categoria:'Core',
    contraindicaciones:[], nivel:'BAJO',
    series_recomendadas:3, repeticiones_recomendadas:30 },
  { nombre:'Caminata Rápida', categoria:'Cardio',
    contraindicaciones:['EPOC','ASMA','PROBLEMAS_CARDIACOS'].map(U),
    nivel:'BAJO', series_recomendadas:1, repeticiones_recomendadas:20 },
  { nombre:'Zancadas', categoria:'Piernas',
    contraindicaciones:['LESION_RODILLA'].map(U),
    nivel:'INTERMEDIO', series_recomendadas:3, repeticiones_recomendadas:12 },
  { nombre:'Press Militar', categoria:'Hombros',
    contraindicaciones:['LESION_HOMBRO','CIRUGIA_RECIENTE'].map(U),
    nivel:'INTERMEDIO', series_recomendadas:4, repeticiones_recomendadas:8 },
  { nombre:'Curl de Bíceps', categoria:'Brazos',
    contraindicaciones:[], nivel:'BAJO',
    series_recomendadas:3, repeticiones_recomendadas:12 },
  { nombre:'Extensión de Tríceps', categoria:'Brazos',
    contraindicaciones:['LESION_HOMBRO'].map(U),
    nivel:'BAJO', series_recomendadas:3, repeticiones_recomendadas:12 },
  { nombre:'Jumping Jacks', categoria:'Cardio',
    contraindicaciones:['PROBLEMAS_CARDIACOS','HIPERTENSION_NO_CONTROLADA'].map(U),
    nivel:'BAJO', series_recomendadas:3, repeticiones_recomendadas:30 },
  { nombre:'Elevación de Cadera (Puente)', categoria:'Glúteos',
    contraindicaciones:['LUMBALGIA'].map(U),
    nivel:'BAJO', series_recomendadas:3, repeticiones_recomendadas:15 },
];

const FOODS: SeedFood[] = [
  { nombre:'Pechuga de Pollo', categoria:'Proteína', alergenos:[] },
  { nombre:'Avena', categoria:'Cereal', alergenos:['GLUTEN'].map(U) },
  { nombre:'Manzana', categoria:'Fruta', alergenos:[] },
  { nombre:'Yogur Natural', categoria:'Lácteos', alergenos:['LACTEOS'].map(U) },
  { nombre:'Pan Integral', categoria:'Cereal', alergenos:['GLUTEN'].map(U) },
  { nombre:'Tofu', categoria:'Proteína vegetal', alergenos:['SOYA'].map(U) },
  { nombre:'Salmón', categoria:'Pescado', alergenos:['PESCADO'].map(U) },
  { nombre:'Camarón', categoria:'Mariscos', alergenos:['MARISCOS'].map(U) },
  { nombre:'Semillas de Sésamo', categoria:'Semillas', alergenos:['SESAMO'].map(U) },
  { nombre:'Cacahuate', categoria:'Frutos secos', alergenos:['CACAHUATE','FRUTOS_SECOS'].map(U) },
  { nombre:'Mostaza', categoria:'Condimento', alergenos:['MOSTAZA'].map(U) },
  { nombre:'Apio', categoria:'Vegetal', alergenos:['APIO'].map(U) },
  { nombre:'Maíz', categoria:'Grano', alergenos:['MAIZ'].map(U) },
  { nombre:'Jugo de Naranja', categoria:'Bebida', alergenos:['CITRICOS'].map(U) },
  { nombre:'Vino Blanco', categoria:'Bebida', alergenos:['SULFITOS'].map(U) },
];

const ROUTINES: SeedRoutine[] = [
  // (1) ya existente
  { nombre:'Fuerza principiante', dias:['LUNES','MIERCOLES','VIERNES'],
    ejercicios:['Plancha','Curl de Bíceps','Extensión de Tríceps','Elevación de Cadera (Puente)','Caminata Rápida'],
    alimentos:['Pechuga de Pollo','Avena','Manzana','Yogur Natural','Pan Integral'] },

  // (2) ya existente
  { nombre:'Cardio básico', dias:['MARTES','JUEVES','SABADO'],
    ejercicios:['Caminata Rápida','Jumping Jacks','Plancha'],
    alimentos:['Manzana','Jugo de Naranja','Vino Blanco'] },

  // (3) ya existente
  { nombre:'Full Body intermedio', dias:['LUNES','JUEVES'],
    ejercicios:['Sentadilla','Peso Muerto','Press de Banca','Remo con Mancuerna','Press Militar','Plancha'],
    alimentos:['Salmón','Camarón','Tofu','Pan Integral','Semillas de Sésamo','Cacahuate'] },

  // (4)
  { nombre:'Torso intermedio', dias:['LUNES','JUEVES'],
    ejercicios:['Press de Banca','Remo con Mancuerna','Press Militar','Plancha'],
    alimentos:['Pechuga de Pollo','Pan Integral','Yogur Natural','Manzana'] },

  // (5)
  { nombre:'Piernas y glúteos', dias:['MARTES','VIERNES'],
    ejercicios:['Sentadilla','Zancadas','Elevación de Cadera (Puente)','Plancha'],
    alimentos:['Avena','Tofu','Semillas de Sésamo','Jugo de Naranja'] },

  // (6)
  { nombre:'Cardio & Core básico', dias:['MARTES','JUEVES','SABADO'],
    ejercicios:['Caminata Rápida','Jumping Jacks','Plancha','Elevación de Cadera (Puente)'],
    alimentos:['Manzana','Maíz','Apio'] },

  // (7)
  { nombre:'Empuje intermedio (Push)', dias:['LUNES','MIERCOLES'],
    ejercicios:['Press de Banca','Press Militar','Extensión de Tríceps','Plancha'],
    alimentos:['Pechuga de Pollo','Pan Integral','Mostaza'] },

  // (8)
  { nombre:'Jalón intermedio (Pull)', dias:['MARTES','VIERNES'],
    ejercicios:['Remo con Mancuerna','Curl de Bíceps','Peso Muerto','Plancha'],
    alimentos:['Salmón','Pan Integral','Apio'] },

  // (9)
  { nombre:'Full Body básico', dias:['LUNES','MIERCOLES','VIERNES'],
    ejercicios:['Sentadilla','Curl de Bíceps','Extensión de Tríceps','Plancha'],
    alimentos:['Avena','Manzana','Yogur Natural'] },

  // (10)
  { nombre:'Full Body avanzado', dias:['MARTES','JUEVES'],
    ejercicios:['Peso Muerto','Sentadilla','Press de Banca','Plancha'],
    alimentos:['Salmón','Camarón','Cacahuate'] },

  // (11)
  { nombre:'Resistencia de piernas', dias:['MIERCOLES','SABADO'],
    ejercicios:['Caminata Rápida','Sentadilla','Zancadas'],
    alimentos:['Avena','Maíz','Jugo de Naranja'] },

  // (12)
  { nombre:'Circuito express', dias:['MARTES','JUEVES','SABADO'],
    ejercicios:['Jumping Jacks','Plancha','Elevación de Cadera (Puente)','Curl de Bíceps'],
    alimentos:['Manzana','Pan Integral','Pechuga de Pollo'] },

  // (13)
  { nombre:'Upper body fuerza', dias:['LUNES','JUEVES','DOMINGO'],
    ejercicios:['Press de Banca','Remo con Mancuerna','Curl de Bíceps','Extensión de Tríceps','Press Militar'],
    alimentos:['Pechuga de Pollo','Pan Integral','Yogur Natural'] },
];

export async function seedDemoData(ds: DataSource) {
  const exRepo = ds.getRepository(Exercise);
  const foRepo = ds.getRepository(Food);
  const prRepo = ds.getRepository(PublicRoutine);
  const reRepo = ds.getRepository(RoutineExercise);
  const rfRepo = ds.getRepository(RoutineFood);

  // EJERCICIOS
  for (const e of EXERCISES) {
    const slug = slugify(e.nombre);
    const existing = await exRepo.findOne({ where: { slug } });
    if (existing) {
      existing.nombre = e.nombre;
      existing.categoria = e.categoria ?? null;
      existing.contraindicaciones = e.contraindicaciones.map(U);
      (existing as any).nivel = e.nivel; // BAJO | INTERMEDIO | AVANZADO
      (existing as any).series_recomendadas = e.series_recomendadas ?? null;
      (existing as any).repeticiones_recomendadas = e.repeticiones_recomendadas ?? null;
      await exRepo.save(existing);
    } else {
      const row = exRepo.create({
        slug,
        nombre: e.nombre,
        categoria: e.categoria ?? null,
        contraindicaciones: e.contraindicaciones.map(U),
        nivel: e.nivel, // BAJO | INTERMEDIO | AVANZADO
        series_recomendadas: e.series_recomendadas ?? null,
        repeticiones_recomendadas: e.repeticiones_recomendadas ?? null,
      } as any);
      await exRepo.save(row);
    }
  }

  // ALIMENTOS
  for (const f of FOODS) {
    const slug = slugify(f.nombre);
    const existing = await foRepo.findOne({ where: { slug } });
    if (existing) {
      existing.nombre = f.nombre;
      existing.categoria = f.categoria ?? null;
      existing.alergenos = f.alergenos.map(U);
      await foRepo.save(existing);
    } else {
      const row = foRepo.create({
        slug,
        nombre: f.nombre,
        categoria: f.categoria ?? null,
        alergenos: f.alergenos.map(U),
      } as any);
      await foRepo.save(row);
    }
  }

  // RUTINAS
  for (const r of ROUTINES) {
    const slug = slugify(r.nombre);
    const existing = await prRepo.findOne({ where: { slug } });
    if (existing) {
      existing.nombre = r.nombre;
      (existing as any).dias = r.dias;
      await prRepo.save(existing);
    } else {
      const row = prRepo.create({ slug, nombre: r.nombre, dias: r.dias } as any);
      await prRepo.save(row);
    }
  }

  // JOINS
  const allE = await exRepo.find();
  const allF = await foRepo.find();
  const allR = await prRepo.find();
  const eByName = new Map(allE.map(e => [e.nombre, e]));
  const fByName = new Map(allF.map(f => [f.nombre, f]));
  const rByName = new Map(allR.map(r => [r.nombre, r]));

  for (const r of ROUTINES) {
    const R = rByName.get(r.nombre);
    if (!R) continue;

    await reRepo.delete({ routine_id: (R as any).id } as any);
    await rfRepo.delete({ routine_id: (R as any).id } as any);

    for (let i = 0; i < r.ejercicios.length; i++) {
      const ex = eByName.get(r.ejercicios[i]);
      if (!ex) continue;
      await reRepo.save(reRepo.create({
        routine_id: (R as any).id,
        exercise_id: (ex as any).id,
        orden: i + 1,
      } as any));
    }

    for (let i = 0; i < r.alimentos.length; i++) {
      const fo = fByName.get(r.alimentos[i]);
      if (!fo) continue;
      await rfRepo.save(rfRepo.create({
        routine_id: (R as any).id,
        food_id: (fo as any).id,
        orden: i + 1,
      } as any));
    }
  }

  console.log(`[seedDemoData] OK — Ejercicios: ${EXERCISES.length}, Alimentos: ${FOODS.length}, Rutinas: ${ROUTINES.length}`);
}
