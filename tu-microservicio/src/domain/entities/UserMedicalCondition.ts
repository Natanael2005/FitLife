import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'user_medical_conditions' })
export class UserMedicalCondition {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('varchar', { length: 50 })
  condition_id!: string;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
