import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity()
export class JobSignDoc {
  @PrimaryColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  jobId: string;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid')
  signedUserId?: string;

  @Column({type: 'uuid', nullable: true})
  docTemplateId: string;

  @Column({nullable: true})
  docFieldHash: string;
}
