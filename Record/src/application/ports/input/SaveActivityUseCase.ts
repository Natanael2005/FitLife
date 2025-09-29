import { Activity } from './../../../domain/entities/Activity';
export interface SaveActivityUseCase {
  execute(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
}
