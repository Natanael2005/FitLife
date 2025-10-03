import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'demo_exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column('varchar', { length: 60 })
  slug!: string;

  @Column('varchar', { length: 200 })
  nombre!: string;

  @Column('varchar', { length: 100, nullable: true })
  categoria?: string | null;

  @Column('text', { array: true, default: '{}' })
  contraindicaciones!: string[]; // slugs: 'lesion_rodilla', ...

  @Column('varchar', { length: 10 })
  impacto!: 'BAJO' | 'MEDIO' | 'ALTO';

  @Column({ name: 'nivel', type: 'varchar', length: 20 })
  nivel!: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

  @Column('int', { nullable: true })
  series_recomendadas?: number | null;

  @Column('int', { nullable: true })
  repeticiones_recomendadas?: number | null;
}
