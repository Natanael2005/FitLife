import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'medical_conditions' })
export class MedicalCondition {
  @PrimaryColumn('varchar', { length: 50 })
  id!: string; // p. ej. "lesion_rodilla", "asma"

  @Column('varchar', { length: 120 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;
}
