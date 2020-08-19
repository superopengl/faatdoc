import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Role } from '../enums/Role';
import { UserStatus } from '../enums/UserStatus';


@Entity()
@Index('user_email_unique', { synchronize: false })
@Index('user_memberId_unique', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  // @Index('user_email_unique', { unique: true })
  /**
   * The unique index of user_email_unique will be created by migration script,
   * as TypeOrm doesn't support case insensitive index.
   */
  @Column()
  email!: string;

  // @Index('user_memberId_unique', { unique: true })
  /**
   * The unique index of user_memberId_unique will be created by migration script,
   * as TypeOrm doesn't support case insensitive index.
   */
  @Column({ nullable: true })
  memberId?: string;

  @Index('user_sessionId_unique', { unique: true })
  @Column({ type: 'uuid', nullable: true })
  sessionId?: string;

  @Column()
  secret!: string;

  @Column({ type: 'uuid' })
  salt!: string;

  @Column({ nullable: false })
  role!: Role;

  @Column({ nullable: true })
  lastLoggedInAt?: Date;

  @Column({ nullable: true })
  lastNudgedAt?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ default: UserStatus.Enabled })
  status!: UserStatus;

  @Index('user_resetPasswordToken_unique', { unique: true })
  @Column({ type: 'uuid', nullable: true })
  resetPasswordToken?: string;


  @Column({ default: false })
  ssoGoogle: boolean;
}

