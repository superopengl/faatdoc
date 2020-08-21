import { Column, PrimaryColumn, Entity } from 'typeorm';
import { LodgementFileStatus } from '../enums/LodgementFileStatus';
import { LodgementFileTag } from '../enums/LodgementFileTag';

@Entity()
export class LodgementFile {
  @PrimaryColumn('uuid')
  id: string;


  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;


  @Column('uuid')
  lodgementId: string;


  @Column('uuid')
  fileId: string;


  @Column({ type: 'varchar', default: `{"${LodgementFileTag.UPLOAD}"}`, array: true })
  tags: LodgementFileTag[];


  @Column({ default: LodgementFileStatus.UPLOADED })
  status: LodgementFileStatus;
}
