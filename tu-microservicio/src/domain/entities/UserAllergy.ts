import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'user_allergies' })
export class UserAllergy {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('varchar', { length: 50 })
  allergy_id!: string;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}