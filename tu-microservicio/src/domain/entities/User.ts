// User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'firebase_uid', unique: true })
  firebaseUid!: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  // 👇 fuerza el tipo en DB para evitar "Object"
  @Column('varchar', { length: 20, nullable: true })
  gender?: string | null;

  @Column({ name: 'profile_completed', default: false })
  profileCompleted!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
