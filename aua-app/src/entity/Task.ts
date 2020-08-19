import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id?: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;


  @Column('uuid')
  userId: string;




  @Column({ default: 'new' })
  status: string;
}
