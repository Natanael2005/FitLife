import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column()
  createdAt!: Date;

  @Column()
  scheduledAt!: Date;

  @Column({ nullable: true })
  sentAt?: Date;

  @Column()
  status!: 'scheduled' | 'sent' | 'failed';
}

