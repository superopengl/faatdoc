import { Entity, Column, PrimaryColumn, Index, ManyToMany, JoinTable, Unique } from 'typeorm';

@Entity()
@Unique('user_portofolio_name_unique', ['userId', 'name'])
export class Portofolio {
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

  @Column({default: false})
  deleted: boolean;

  @Column({type: 'json'})
  fields: any;
}
