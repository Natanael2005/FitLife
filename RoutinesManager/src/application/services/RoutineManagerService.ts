
import { UserRoutineRepository } from '../ports/output/UserRoutineRepository';
import { RoutineServiceClient } from '../ports/output/RoutineServiceClient';
import { UserRoutine } from '../../domain/entities/UserRoutine';
import { UserRoutineAlreadyExists, UserRoutineNotFound } from '../../domain/exceptions/UserRoutineExceptions';

export class RoutineManagerService {

  
  constructor(
    private readonly userRoutineRepository: UserRoutineRepository,
    private readonly routineServiceClient: RoutineServiceClient
  ) {}

async assignRoutine(userId: string, routineId: string): Promise<UserRoutine> {
  // Verificar que la rutina existe en el servicio de rutinas
  try {
    await this.routineServiceClient.getRoutineDetails(routineId);
  } catch (error) {
    throw new Error(`Routine ${routineId} not found in routine service`);
  }

  // Verificar que no exista ya la asignación
  const existing = await this.userRoutineRepository.findByUserAndRoutine(userId, routineId);
  if (existing && existing.isActive) {
    throw new UserRoutineAlreadyExists(
      `User ${userId} already has routine ${routineId} assigned`
    );
  }

  // Si existe pero está inactiva, reactivarla
  if (existing && !existing.isActive) {
    return await this.userRoutineRepository.updateStatus(existing.id, true);
  }

  // Crear nueva asignación
  return await this.userRoutineRepository.save(userId, routineId);
}

async getUserRoutines(userId: string): Promise<UserRoutine[]> {
  return await this.userRoutineRepository.findByUserId(userId);
}

async removeRoutine(userId: string, routineId: string): Promise<void> {
  const existing = await this.userRoutineRepository.findByUserAndRoutine(userId, routineId);
  if (!existing) {
    throw new UserRoutineNotFound(
      `User ${userId} does not have routine ${routineId} assigned`
    );
  }

  await this.userRoutineRepository.delete(userId, routineId);
}

  async getUserRoutinesWithDetails(userId: string): Promise<any[]> {
    const userRoutines = await this.userRoutineRepository.findByUserId(userId);
    
    if (userRoutines.length === 0) {
      return [];
    }

    const routineIds = userRoutines.map(ur => ur.rutina_id);
    const routineDetails = await this.routineServiceClient.getMultipleRoutines(routineIds);

    return userRoutines.map(ur => {
      const details = routineDetails.find(rd => rd.id === ur.rutina_id);
      return {
        userRoutineId: ur.id,
        userId: ur.usuario_id,
        routineId: ur.rutina_id,
        assignedAt: ur.assignedAt,
        isActive: ur.isActive,
        routineDetails: details || null
      };
    });
  }
}
