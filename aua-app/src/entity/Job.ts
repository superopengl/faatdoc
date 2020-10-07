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

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column('uuid')
  userId: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column({ type: 'json' })
  fields: any;

  @Column({ type: 'json', array: true, default: '{}' })
  genDocs: GenDoc[];

  @Column({ type: 'json', array: true, default: '{}' })
  uploadDocs: UploadDoc[];

  @Column({ type: 'json', array: true, default: '{}' })
  signDocs: SignDoc[];

  @Column({ type: 'json', array: true, default: '{}' })
  feedbackDocs: FeedbackDoc[];
}

export type GenDoc = {
  docTemplateId: string,
  docTemplateName: string,
  docTemplateDescription: string, 
  variables: { name: string, value?: string }[],
  varHash?: string,
  fileId?: string,
  fileName?: string,
  status: 'skipped' | 'agreed' | 'pending'
};

export type UploadDoc = {
  fileId: string,
  fileName: string,
};

export type SignDoc = {
  fileId: string,
  fileName: string,
  lastReadAt: Date,
  signedAt: Date,
};


export type FeedbackDoc = {
  fileId: string,
  fileName: string
};

