import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity()
export class JobTemplate {
  @PrimaryColumn('uuid')
  id: string;


  @Column()
  name: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;


  @Column()
  lastUpdatedAt: Date;


  @Column({ type: 'json' })
  fields: any;
}
