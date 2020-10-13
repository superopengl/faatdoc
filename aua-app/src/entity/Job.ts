import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';
import { JobStatus } from '../types/JobStatus';
import { FeedbackDoc } from '../types/FeedbackDoc';
import { GenDoc } from '../types/GenDoc';
import { SignDoc } from '../types/SignDoc';
import { UploadDoc } from '../types/UploadDoc';
import { stringType } from 'aws-sdk/clients/iam';
import { JobDoc } from '../types/JobDoc';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
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

  // @Column({ type: 'json', default: [] })
  // genDocs: GenDoc[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // uploadDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // signDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // feedbackDocs: string[];

  @Column({ type: 'json', default: [] })
  docs: JobDoc[];
}


