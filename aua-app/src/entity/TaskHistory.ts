import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../enums/TaskStatus';


@Entity()
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  taskId: string;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column({ default: TaskStatus.DRAFT })
  status: TaskStatus;

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column({ type: 'json' })
  fields: any;
}
