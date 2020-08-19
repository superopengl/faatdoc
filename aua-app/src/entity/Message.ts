import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  thread: string;

  @Column({default: true})
  received: boolean;

  @Column('uuid')
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  taskId?: string;

  @Column()
  content: string;

  @Column({default: false})
  hasRead: boolean;
}
