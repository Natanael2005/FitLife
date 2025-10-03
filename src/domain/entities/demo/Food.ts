import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'demo_foods' })
export class Food {
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
  alergenos!: string[]; // slugs: 'gluten','lacteos', ...
}
