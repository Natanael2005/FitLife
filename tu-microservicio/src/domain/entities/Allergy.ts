import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'allergies' })
export class Allergy {
  @PrimaryColumn('varchar', { length: 50 })
  id!: string; // p. ej. "gluten", "lacteos"

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string | null;
}
