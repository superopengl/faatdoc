import { Entity, Column, PrimaryColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { File } from './File';

@Entity()
export class Profile {
  @PrimaryColumn('uuid')
  id: string;

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

  @Column()
  lastUpdatedAt?: Date;

  @Column({nullable: true})
  remark?: string;

  @Column({nullable: true})
  wechat?: string;

  @Column({nullable: true})
  occupation: string;

  @Column({nullable: true})
  industry: string;
}
