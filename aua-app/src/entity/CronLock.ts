import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { Role } from '../enums/Role';
import { UserStatus } from '../enums/UserStatus';


@Entity()
export class CronLock {
  @PrimaryColumn()
  gitHash: string;

  @Column()
  lockedAt: Date;

  @Column()
  by: string;
}

