import { UserRoutineRepository } from '../ports/output/UserRoutineRepository';
import { UserRoutine } from '../../domain/entities/UserRoutine';
import { UserRoutineNotFound } from '../../domain/exceptions/UserRoutineExceptions';

export class RoutineManagerService {
  constructor(
    private readonly userRoutineRepository: UserRoutineRepository
  ) {}

  async assignRoutine(userId: string, routineId: string): Promise<UserRoutine> {
    // Verificar que la rutina existe
    const routine = await this.userRoutineRepository.findById(routineId);
    if (!routine) {
      throw new Error(`Routine ${routineId} not found`);
    }

    // Verificar que pertenece al usuario o es pública
    if (routine.usuario_id !== userId) {
      throw new Error(`User ${userId} cannot assign routine ${routineId}`);
    }

    return routine;
  }

  async getUserRoutines(userId: string): Promise<UserRoutine[]> {
    return await this.userRoutineRepository.findByUserId(userId);
  }

  async removeRoutine(userId: string, routineId: string): Promise<void> {
    const existing = await this.userRoutineRepository.findByUserAndRoutine(userId, routineId);
    if (!existing) {
      throw new UserRoutineNotFound(
        `User ${userId} does not have routine ${routineId}`
      );
    }

    await this.userRoutineRepository.delete(routineId);
  }

  async getUserRoutinesWithDetails(userId: string): Promise<any[]> {
    const userRoutines = await this.userRoutineRepository.findByUserId(userId);
    
    return userRoutines.map(ur => ({
      userRoutineId: ur.id,
      userId: ur.usuario_id,
      routineId: ur.id,
      name: ur.nombre,
      days: ur.dias,
      exercises: ur.ejercicios,
      foods: ur.alimentos,
      createdAt: ur.created_at,
      updatedAt: ur.updated_at
    }));
  }
}