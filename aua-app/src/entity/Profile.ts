import { Entity, Column, PrimaryColumn, Index, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  givenName: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: true })
  company: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  address?: string;

  @Column()
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({nullable: true})
  tfn: string;

  @Column({nullable: true})
  abn: string;

  @Column({nullable: true})
  acn: string;

  @Column({nullable: true})
  remark?: string;

  @Column({nullable: true})
  wechat?: string;

  @Column({nullable: true})
  occupation: string;

  @Column({nullable: true})
  industry: string;
}
