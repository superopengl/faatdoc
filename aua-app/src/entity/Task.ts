import { Column, PrimaryColumn, Entity } from 'typeorm';
import { TaskStatus } from '../enums/TaskStatus';

@Entity()
export class Task {
  @PrimaryColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column()
  forWhom: string;

  @Column({ default: TaskStatus.DRAFT })
  status: TaskStatus;

  @Column('uuid')
  jobTemplateId: string;

  @Column('uuid')
  portofolioId: string;

  @Column('uuid', {nullable: true})
  agentId?: string;

  @Column('uuid')
  userId: string;

  @Column({nullable: true})
  signedAt?: Date;

  @Column({type: 'json'})
  fields: any;
}
