import { Column, PrimaryColumn, Entity, Index } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  nameTemplate: string;

  @Column('uuid')
  jobTemplateId: string;

  @Column('uuid')
  portofolioId: string;

  @Column()
  cron: string;

  @Column({nullable: true})
  dueDay: number;

  @Column()
  lastUpdatedAt: Date;
}


