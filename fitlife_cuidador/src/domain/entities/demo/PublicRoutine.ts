import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'demo_public_routines' })
export class PublicRoutine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column('varchar', { length: 60 })
  slug!: string;

  @Column('varchar', { length: 200 })
  nombre!: string;

  @Column('text', { array: true, default: '{}' })
  dias!: string[];
}
