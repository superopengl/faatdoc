import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JobStatus } from '../types/JobStatus';
import { FeedbackDoc } from '../types/FeedbackDoc';
import { GenDoc } from '../types/GenDoc';
import { SignDoc } from '../types/SignDoc';
import { UploadDoc } from '../types/UploadDoc';

@Entity()
export class JobHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => `timezone('UTC', now())` })
  historyCreatedAt?: Date;

  @Column('uuid')
  jobId: string;

  @Column()
  name: string;

  @Column({ default: JobStatus.TODO })
  status: JobStatus;

  @Column('uuid', { nullable: true })
  agentId?: string;

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
