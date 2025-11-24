import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IOrchestratorService } from '../../../../application/ports/input/orchestrator.service.js';
import { InvalidPayloadError } from '../../../../domain/entities/errors.js';
import { DiaSemana } from '../../../../domain/entities/routine.js';

// --- DEFINICIONES DE VALORES PERMITIDOS ---
const diasSemanaValidos: [DiaSemana, ...DiaSemana[]] = [
  'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'
];

const contraindicacionesValidas = [
  "PROBLEMAS_CARDIACOS", "HIPERTENSION_NO_CONTROLADA", "ARRITMIAS", 
  "INSUFICIENCIA_CARDIACA", "CIRUGIA_RECIENTE", "FRACTURA_RECIENTE", 
  "HERNIA_DISCAL", "OSTEOPOROSIS_SEVERA", "EMBARAZO_RIESGO", 
  "TROMBOSIS_RECIENTE", "EPOC", "ASMA", "LESION_ESPALDA", 
  "LESION_RODILLA", "LESION_HOMBRO"
] as const;

const alergenosValidos = [
  "GLUTEN", "LACTEOS", "HUEVO", "SOYA", "FRUTOS_SECOS", "CACAHUATE",
  "SESAMO", "PESCADO", "MARISCOS", "MOSTAZA", "APIO", "ALTRAMUZ",
  "SULFITOS", "MAIZ", "CITRICOS"
] as const;


// --- ESQUEMAS DETALLADOS DE ZOD ---
const ejercicioSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    categoria: z.string(),
    contraindicaciones: z.array(z.enum(contraindicacionesValidas)),
    nivel: z.enum(["BAJO", "INTERMEDIO", "AVANZADO"]),
    series_recomendadas: z.number(),
    repeticiones_recomendadas: z.number(),
    gif_url: z.string(),
    musculo_principal: z.string(),
    musculo_secundario: z.string(),
    instrucciones: z.array(z.string()),
    isActive: z.boolean().optional(),
   
});

// --- CAMBIO APLICADO: Este es el nuevo esquema de alimentos ---
const alimentoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    categoria: z.string(),
    imagen: z.string().optional(),
    alergenos: z.array(z.enum(alergenosValidos)), // Mantenemos la validación estricta
    calorias: z.number().min(0, "Las calorías no pueden ser negativas"),
    proteinas: z.number().optional(),
    isActive: z.boolean().optional(),
});

const createRoutineSchema = z.object({
  usuario_id: z.string().min(1),
  nombre: z.string().min(1),
  dias: z.array(z.enum(diasSemanaValidos)),
  ejercicios: z.array(ejercicioSchema),
  alimentos: z.array(alimentoSchema),
});

const getCreationOptionsSchema = z.object({
  usuarioId: z.string().min(1, "Query param 'usuarioId' is required"),
});


// --- CONTROLADOR ---
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export class OrchestratorController {
  constructor(private readonly service: IOrchestratorService) {}

  getCreationOptions = asyncHandler(async (req, res, next) => {
    const { usuarioId } = getCreationOptionsSchema.parse(req.query);
    const options = await this.service.getCreationOptions(usuarioId);
    res.status(200).json(options);
  });

  createRoutine = asyncHandler(async (req, res, next) => {
    const snapshot = createRoutineSchema.parse(req.body);
    const routine = await this.service.createRoutine(snapshot);
    res.status(201).json(routine);
  });

  cloneRoutine = asyncHandler(async (req, res, next) => {
      const { defaultId } = req.params;
      const { usuario_id } = req.body;
      if (!usuario_id) throw new InvalidPayloadError(['usuario_id is required']);
      const routine = await this.service.cloneFromPublic(defaultId, { usuario_id });
      res.status(201).json(routine);
  });
  
  listUserRoutines = asyncHandler(async(req, res, next) => {
    const { usuarioId } = req.query;
    if (!usuarioId) throw new InvalidPayloadError(['Query param usuarioId is required']);
    const routines = await this.service.listUserRoutines(usuarioId as string);
    res.status(200).json(routines);
  });
  
  getUserRoutine = asyncHandler(async(req, res, next) => {
    const { id } = req.params;
    const { usuarioId } = req.query;
    if (!usuarioId) throw new InvalidPayloadError(['Query param usuarioId is required']);
    const routine = await this.service.getUserRoutine(id, usuarioId as string);
    res.status(200).json(routine);
  });
  
  listPublicRoutines = asyncHandler(async(req, res, next) => {
      const routines = await this.service.listPublicRoutines();
      res.status(200).json(routines);
  });

  getPublicRoutine = asyncHandler(async(req, res, next) => {
      const { id } = req.params;
      const routine = await this.service.getPublicRoutine(id);
      res.status(200).json(routine);
  });
}