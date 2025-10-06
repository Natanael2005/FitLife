import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type Nivel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
export type CategoriaIMC =
  | 'BAJO_PESO' | 'NORMAL' | 'SOBREPESO'
  | 'OBESIDAD_I' | 'OBESIDAD_II' | 'OBESIDAD_III';

@Entity({ name: 'user_health_data' })
export class UserHealthData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  user_id!: string;

  @Column('numeric', { precision: 5, scale: 2 })
  peso_kg!: string; // TypeORM maneja NUMERIC como string

  @Column('int')
  estatura_cm!: number;

  @Column('numeric', { precision: 4, scale: 2 })
  imc!: string;

  @Column('varchar', { length: 20 })
  categoria_imc!: CategoriaIMC;

  @Column('varchar', { name: 'nivel', length: 20 })
  nivel!: 'BAJO' | 'INTERMEDIO' | 'ALTO';
}

