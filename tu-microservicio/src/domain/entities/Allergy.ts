import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'allergies' })
@Unique(['slug'])
export class Allergy {
  @PrimaryGeneratedColumn('uuid', { name: 'allergy_id' })
  id!: string;         // UUID PK

  @Column('varchar', { length: 50 })
  slug!: string;       // 'gluten', 'lacteos', único

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;
}