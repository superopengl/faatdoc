import { Entity, Column, PrimaryColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { File } from './File';

@Entity()
export class IndividualProfile {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  secondaryName?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column()
  approvalDirector: string;

  @Column({ nullable: true })
  address?: string;

  @Column()
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  wechat?: string;

  @Column({ nullable: true })
  facebook?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  skype?: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  hobby?: string;
}
