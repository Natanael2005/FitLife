import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'demo_routine_foods' })
export class RoutineFood {
  @PrimaryColumn('uuid')
  routine_id!: string;

  @PrimaryColumn('uuid')
  food_id!: string;

  @Column('int', { default: 1 })
  orden!: number;
}
