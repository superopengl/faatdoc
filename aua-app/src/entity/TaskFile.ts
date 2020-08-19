import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TaskFile {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  fileId: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: 'new' })
  status: string;

  @Column({ nullable: true })
  signedAt: Date;
}
