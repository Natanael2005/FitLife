import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class UserProfile {
    // PRIMARY KEY - UUID
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    // FIREBASE UID
    @Index({ unique: true })
    @Column({ type: 'varchar' })
    uid!: string;
    @Column({ type: 'varchar', name: "first_name", nullable: true })
    firstName?: string;
    @Column({ type: 'varchar', name: "last_name", nullable: true })
    lastName?: string;
    @Column({ type: 'varchar', nullable: true })
    gender?: string;
    @Column({ type: 'timestamp',name:"created_at", default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
    @Column({ type: 'timestamp',name:"updated_at", nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt?: Date;
    @Column({ type: 'boolean',name: "profile_completed", nullable: true })
    profileCompleted?: boolean;
    @Column({ type: 'boolean', name: "enable_recordatorios", nullable: true })
    enableRecordatorios?: boolean;
    @Column({ type: 'varchar', name: "notification_token", nullable: true })
    notificationToken?: string;
}