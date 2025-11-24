import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'user_allergies' })
export class UserAllergy {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  allergy_id!: string; // ahora UUID

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}