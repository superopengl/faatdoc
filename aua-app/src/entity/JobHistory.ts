import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JobStatus as JobStatus } from '../enums/JobStatus';


@Entity()
export class JobHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  taskId: string;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column()
  status: JobStatus;

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column({ type: 'json' })
  fields: any;
}
