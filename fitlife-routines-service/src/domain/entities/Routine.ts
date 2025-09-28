import { RoutineId } from '../value-objects/RoutineId.js';
import { UserId } from '../value-objects/UserId.js';
import { Exercise } from './Exercise.js';
import { Food } from './Food.js';

export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export class Routine {
  private id: RoutineId;
  private userId: UserId;
  private name: string;
  private description?: string;
  private days: DayOfWeek[];
  private exercises: Exercise[];
  private foods: Food[];
  private isPublic: boolean;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;
    isPublicFlag: any;
    isActiveFlag: any;

  constructor(params: {
    id?: RoutineId;
    userId: UserId;
    name: string;
    description?: string;
    days?: DayOfWeek[];
    exercises?: Exercise[];
    foods?: Food[];
    isPublic?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id || new RoutineId();
    this.userId = params.userId;
    this.name = params.name;
    this.description = params.description;
    this.days = params.days || [];
    this.exercises = params.exercises || [];
    this.foods = params.foods || [];
    this.isPublic = params.isPublic || false;
    this.isActive = params.isActive ?? true;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Routine name is required');
    }

    if (this.name.length > 100) {
      throw new Error('Routine name cannot exceed 100 characters');
    }

    if (this.exercises.length === 0 && this.foods.length === 0) {
      throw new Error('Routine must have at least one exercise or food item');
    }
  }

  // Getters
  getId(): RoutineId {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getDays(): DayOfWeek[] {
    return [...this.days];
  }

  getExercises(): Exercise[] {
    return [...this.exercises];
  }

  getFoods(): Food[] {
    return [...this.foods];
  }

  getIsPublic(): boolean {
    return this.isPublic;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  addExercise(exercise: Exercise): void {
    this.exercises.push(exercise);
    this.updatedAt = new Date();
  }

  removeExercise(exerciseId: string): void {
    this.exercises = this.exercises.filter(e => e.getExerciseId() !== exerciseId);
    this.updatedAt = new Date();
  }

  addFood(food: Food): void {
    this.foods.push(food);
    this.updatedAt = new Date();
  }

  removeFood(foodId: string): void {
    this.foods = this.foods.filter(f => f.getFoodId() !== foodId);
    this.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Routine name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDays(days: DayOfWeek[]): void {
    this.days = days;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  makePublic(): void {
    this.isPublic = true;
    this.updatedAt = new Date();
  }

  makePrivate(): void {
    this.isPublic = false;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      name: this.name,
      description: this.description,
      days: this.days,
      exercises: this.exercises.map(e => e.toJSON()),
      foods: this.foods.map(f => f.toJSON()),
      isPublic: this.isPublic,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}