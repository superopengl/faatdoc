import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TaskTracking {
  @PrimaryGeneratedColumn()
  id?: Number;

  @Column('uuid')
  taskId: string;


  @Column('uuid')
  userId: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  event: string;


  @Column({nullable: true})
  preValue: string;


  @Column({nullable: true})
  newValue: string;
}
