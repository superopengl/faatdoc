import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MessageType } from '../enums/MessageType';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  type: MessageType;

  @Column('uuid')
  clientUserId: string;

  @Column('uuid')
  agentUserId: string;

  @Column()
  content: string;

  @Column({nullable: true})
  readAt?: Date;
}
