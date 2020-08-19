import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id?: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;


  @Column('uuid')
  thread: string;


  @Column('uuid')
  from: string;


  @Column('uuid')
  to: string;


  @Column({ type: 'uuid', nullable: true })
  taskId?: string;


  @Column()
  content: string;


  @Column({ type: 'uuid', array: true, nullable: true })
  files: string[];
}
