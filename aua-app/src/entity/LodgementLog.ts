import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['lodgementId', 'event', 'createdAt'])
export class LodgementLog {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  lodgementId: string;

  @Column()
  event: string;

  @Column('json')
  extra: any;
}
