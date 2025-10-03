import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'medical_conditions' })
@Unique(['slug'])
export class MedicalCondition {
  @PrimaryGeneratedColumn('uuid', { name: 'condition_id' })
  id!: string;         // UUID PK

  @Column('varchar', { length: 50 })
  slug!: string;       // 'lesion_rodilla', único

  @Column('varchar', { length: 120 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;
}