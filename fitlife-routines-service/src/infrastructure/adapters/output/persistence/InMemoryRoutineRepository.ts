import { RoutineRepository } from '../../../../application/ports/output/RoutineRepository.js';
import { Routine } from '../../../../domain/entities/Routine.js';
import { RoutineId } from '../../../../domain/value-objects/RoutineId.js';
import { UserId } from '../../../../domain/value-objects/UserId.js';

export class InMemoryRoutineRepository implements RoutineRepository {
  private readonly store = new Map<string, Routine>();

  async save(routine: Routine): Promise<void> {
    this.store.set(routine.getId().getValue(), routine);
  }

  async findById(id: RoutineId): Promise<Routine | null> {
    return this.store.get(id.getValue()) ?? null;
  }

  async findByUserId(userId: UserId): Promise<Routine[]> {
    const all = Array.from(this.store.values());
    return all.filter(r => r.getUserId().equals(userId));
  }

  async update(routine: Routine): Promise<void> {
    this.store.set(routine.getId().getValue(), routine);
  }

  async delete(id: RoutineId): Promise<void> {
    this.store.delete(id.getValue());
  }
}
