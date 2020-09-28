import { Column, PrimaryColumn, Entity } from 'typeorm';
import { JobStatus } from '../enums/JobStatus';

@Entity()
export class Job {
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

  @Column({ default: JobStatus.TODO })
  status: JobStatus;

  @Column('uuid')
  jobTemplateId: string;

  @Column('uuid')
  portfolioId: string;

  @Column('uuid', {nullable: true})
  agentId?: string;

  @Column('uuid')
  userId: string;

  @Column({nullable: true})
  signedAt?: Date;

  @Column({type: 'json'})
  fields: any;

  @Column({type: 'json', nullable: true})
  uploadDocs: any;

  @Column({type: 'varchar', array: true, default: '{}'})
  docTemplateIds: string[];

  @Column({type: 'json', nullable: true})
  signDocs: any;

  @Column({type: 'json', nullable: true})
  feedbackDocs: any;
}
