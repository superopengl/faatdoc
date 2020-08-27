import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id?: string;


  @Column()
  givenName: string;


  @Column()
  surname: string;


  @Column({nullable: true})
  dob: Date;
}
