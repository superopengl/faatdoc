import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LodgementStatus } from '../enums/LodgementStatus';


@Entity()
export class LodgementHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  lodgementId: string;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column({ default: LodgementStatus.DRAFT })
  status: LodgementStatus;

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column({ type: 'json' })
  fields: any;
}
