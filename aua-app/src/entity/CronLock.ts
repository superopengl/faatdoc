import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { Role } from '../enums/Role';
import { UserStatus } from '../enums/UserStatus';


@Entity()
export class CronLock {
  @PrimaryColumn()
  key: string;

  @Column()
  gitHash: string;

  @Column()
  lockedAt: Date;

  @Column()
  winner: string;

  @Column({nullable: true})
  loser?: string;
}

