import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type Nivel = 'BAJO' | 'INTERMEDIO' | 'AVANZADO';

@Entity('demo_exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string; // clave interna para idempotencia del seed (no se expone)

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria!: string | null;

  // tokens UPPER que cruzan con medical_conditions.slug
  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  contraindicaciones!: string[];

  @Column({ type: 'varchar', length: 15 })
  nivel!: Nivel; // BAJO | INTERMEDIO | AVANZADO

  // impacto eliminado
  @Column({ type: 'int', nullable: true })
  series_recomendadas!: number | null;

  @Column({ type: 'int', nullable: true })
  repeticiones_recomendadas!: number | null;
}
