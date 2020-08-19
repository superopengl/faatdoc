import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TaskTracking {
  @PrimaryGeneratedColumn('uuid')
  id?: string;


  @Column('uuid')
  taskId: string;


  @Column('uuid')
  userId: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;


  @Column()
  statusBefore: string;


  @Column()
  statusAfter: string;
}
