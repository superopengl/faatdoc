import { Column, PrimaryColumn, Entity } from 'typeorm';
import { LodgementStatus } from '../enums/LodgementStatus';

@Entity()
export class Lodgement {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column({ default: LodgementStatus.DRAFT })
  sattus: LodgementStatus;

  @Column('uuid')
  jobTemplateId: string;

  @Column('uuid')
  profileId: string;

  @Column('uuid')
  userId: string;

  @Column({type: 'json'})
  fields: any;
}
