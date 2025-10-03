import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'demo_routine_exercises' })
export class RoutineExercise {
  @PrimaryColumn('uuid')
  routine_id!: string;

  @PrimaryColumn('uuid')
  exercise_id!: string;

  @Column('int', { default: 1 })
  orden!: number;
}
