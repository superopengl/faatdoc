import { Column, PrimaryColumn, Entity } from 'typeorm';
import { JobStatus } from '../types/JobStatus';
import { FeedbackDoc } from '../types/FeedbackDoc';
import { GenDoc } from '../types/GenDoc';
import { SignDoc } from '../types/SignDoc';
import { UploadDoc } from '../types/UploadDoc';

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

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'json' })
  fields: any;

  @Column({ type: 'json', default: [] })
  genDocs: GenDoc[];

  @Column({ type: 'json', default: [] })
  uploadDocs: UploadDoc[];

  @Column({ type: 'json', default: [] })
  signDocs: SignDoc[];

  @Column({ type: 'json', default: [] })
  feedbackDocs: FeedbackDoc[];
}


