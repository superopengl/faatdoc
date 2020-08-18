import { Entity, Column, PrimaryColumn, Index, JoinTable, ManyToMany } from 'typeorm';
import { Image } from './Image';

@Entity()
export class BusinessProfile {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  secondaryName?: string;

  @Column()
  phone: string;

  @Column()
  referrer?: string;

  @Column()
  approvalDirector: string;

  @Column()
  address: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  facebook?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  remark?: string;

  // @ManyToMany(type => Image)
  // @JoinTable()
  // pictures: Image[];
}
