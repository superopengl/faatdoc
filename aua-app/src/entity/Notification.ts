import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  sender: string;

  @Column('uuid')
  @Index()
  clientUserId: string;

  @Column('uuid', {nullable: true})
  @Index()
  agentUserId: string;

  @Column()
  content: string;

  @Column({nullable: true})
  readAt?: Date;

  @Column({default: false})
  deleted: boolean;
}
